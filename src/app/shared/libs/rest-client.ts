import { Warning } from './warning';
import { BusyService } from '../services/busy.service';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Inject } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { MessageUtilService } from '../services/message-util.service';
import { throwError } from 'rxjs';
import { FilterParam } from './filter-param';
import { isObject } from './typechecks';

enum requestMethods {
  GET = 'GET',
  POST = 'POST'
}

const MetadataKeys = {
  QueryParams: Symbol('restClient:QueryParams'),
  ActionPaths: Symbol('restClient:ActionPaths')
};

interface QueryParam {
  name: string;
  value: number | string;
}

interface UrlParam {
  name: string;
  value: number | string;
}

interface FormDataParam {
  name: string;
  value: number | string;
}

// decorators
export function BaseUrl(url: string) {
  return target => {
    target.prototype.getBaseUrlFromDecorator = () => url.replace(/\/$/, '');
  };
}

export function QueryParam(name: string, value: string) {
  return target => {
    const metadataKey = MetadataKeys.QueryParams;
    const existingQueryParams: Array<QueryParam> = target[metadataKey] || [];
    existingQueryParams.push({ name, value });
    target[metadataKey] = existingQueryParams;
    target.prototype.getQueryParamsFromDecorator = () => existingQueryParams;
  };
}

export function Path(path: string) {
  return (
    target,
    targetKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    const method = descriptor.value;
    // tslint:disable-next-line: space-before-function-paren
    descriptor.value = function () {
      this.actionPath = path;
      return method.apply(this, arguments);
    };
    return descriptor;
  };
}

enum HttpAction {
  GET,
  POST,
  PUT,
  DELETE
}

// base class
export abstract class RestClient {
  constructor(
    @Inject(HttpClient) protected http: HttpClient,
    @Inject(BusyService) private busyService: BusyService,
    @Inject(MessageUtilService) private messageService: MessageUtilService
  ) {
  }


  // tslint:disable-next-line: variable-name
  protected _actionPath;

  protected baseUrl;

  private queryParams: Array<QueryParam> = new Array<QueryParam>();
  private urlParams: Array<UrlParam> = new Array<UrlParam>();
  private formDataParams: Array<FormDataParam> = new Array<FormDataParam>();

  private showBusyForNextAction = false;

  private autoCatchError = true;

  private extraHeaders = [];

  // http actions
  async get<T>(noJson = false): Promise<T> {
    // we have to get the decorator action path before any async calls because it could be interrupted by another api call
    const actionPathFromDecorator = this.actionPath;

    this.beforeAction();
    const autoCatchError = this.autoCatchError;
    this.autoCatchError = true;
    this.handleBusyStart();

    // we dont call this for now because we dont want to mess the header
    // this.setHttpHeaders(this.getHttpHeaders());

    const httpOptions = Object.assign({}, this.createHttpOptionsAndClearExtraHeaders());

    if (noJson) {
      httpOptions['responseType'] = 'blob' as 'json';
    }

    const fullUrl = this.getFullUrl(actionPathFromDecorator);
    const result = this.http.get<T>(fullUrl, httpOptions).pipe(
      tap(_ => this.handleBusyEnd()),
      catchError(error => this.handleError(error, this, autoCatchError))
    );

    return result.toPromise();
  }

  protected addHeader(name: string, value: string) {
    this.extraHeaders.push({name, value});
  }

  async delete<T>(): Promise<T> {
    const actionPathFromDecorator = this.actionPath;

    this.beforeAction();
    const autoCatchError = this.autoCatchError;
    this.autoCatchError = true;
    this.handleBusyStart();

    const fullUrl = this.getFullUrl(actionPathFromDecorator);
    const result = this.http.delete<T>(fullUrl, this.createHttpOptionsAndClearExtraHeaders()).pipe(
      tap(_ => this.handleBusyEnd()),
      catchError(error => this.handleError(error, this, autoCatchError))
    );
    return result.toPromise();
  }

  async post<T>(entity?: any, serialize = false, actionPath = '', callBeforeAction = true): Promise<T> {
    return this.putOrPost(HttpAction.POST, entity, serialize, actionPath, callBeforeAction);
  }

  async put<T>(entity?: any, serialize = false, actionPath = '', callBeforeAction = true): Promise<T> {
    return this.putOrPost(HttpAction.PUT, entity, serialize, actionPath, callBeforeAction);
  }

  private async putOrPost<T>(action: HttpAction, entity?: any, serialize = false, actionPath = '', callBeforeAction = true): Promise<T> {
    const actionPathFromDecorator = this.actionPath;

    if (callBeforeAction) {
      this.beforeAction();
    }

    const extraHeaders = this.extraHeaders; // backup extra headers
    let httpOptions = this.createHttpOptionsAndClearExtraHeaders();

    let data;
    if (this.formDataParams.length > 0) {
      // as soon as we have form data, we ignore entity and send only form data
      const formData: FormData = new FormData();
      this.formDataParams.forEach(fdp => {
        formData.append(fdp.name, fdp.value as unknown as Blob);
      });
      data = formData;
      this.formDataParams.length = 0;
      this.extraHeaders = extraHeaders;
      httpOptions = this.createHttpOptionsAndClearExtraHeaders(true);    // using httpClient default headers when sending form data
    } else {
      data = (serialize) ? this.serialize(entity) : entity;
    }

    const autoCatchError = this.autoCatchError;
    this.autoCatchError = true;
    this.handleBusyStart();
    const url = (actionPath !== '') ? this.getBaseUrl() + this.formatActionPath(actionPath) : this.getFullUrl(actionPathFromDecorator);

    // we dont call this for now because we dont want to mess the header
    // this.setHttpHeaders(this.getHttpHeaders());

    let result;
    if (action === HttpAction.POST) {
      result = this.http
        .post<T>(url, data, httpOptions)
        .pipe(
          tap(_ => this.handleBusyEnd()),
          catchError(error => this.handleError(error, this, autoCatchError))
        );
    }

    if (action === HttpAction.PUT) {
      result = this.http
        .put<T>(url, data, httpOptions)
        .pipe(
          tap(_ => this.handleBusyEnd()),
          catchError(error => this.handleError(error, this, autoCatchError))
        );
    }
    return result.toPromise();
  }

  public beforeAction() {
  }

  public serialize(obj, prefix?) {
    const str = [];
    let p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        const k = prefix ? prefix + '[' + p + ']' : p;
        const v = obj[p];
        str.push((v !== null && isObject(v)) ?
          this.serialize(v, k) :
          encodeURIComponent(k) + '=' + encodeURIComponent(v));
      }
    }
    return str.join('&');
  }

  // url functions
  public setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
  }

  public setUrlParam(name: string | object, value: number | string = null) {
    if (value === null) {
      const params: object = name as object;
      Object.keys(params).forEach(key => {
        this.urlParams.push({ name: key, value: params[key] });
      });
    } else {
      this.urlParams.push({ name: name as string, value });
    }
    return this;
  }

  public addQueryParam(name: string, value: any) {
    if (value === undefined) {
      console.error('Error: QueryParam "' + name + '" is undefined!');
      return this;
    }
    if (value === null) {
      console.error('Error: QueryParam "' + name + '" is null!');
      return this;
    }

    this.queryParams.push({ name, value });
    return this;
  }

  public addFilterParam(filterParam: FilterParam) {
    if (filterParam.hasContent()) {
      this.addQueryParam('Filter', filterParam.toString());
    }
    return this;
  }

  public addFormDataParam(name: string, value: any) {
    this.formDataParams.push({name, value});
    return this;
  }

  public getHttpHeaders(): {} {
    return { 'Content-Type':  'application/json'};
  }

  private createHttpOptionsAndClearExtraHeaders(isFormDataPost = false) {
    const headers = [...this.extraHeaders];

    if (!isFormDataPost) {
      headers.push({name: 'Content-Type', value: 'application/x-www-form-urlencoded; charset=UTF-8'});
    }

    let httpHeaders = new HttpHeaders();
    headers.forEach(headerData => {
      httpHeaders = httpHeaders.append(headerData['name'], headerData['value']);
    });

    const result = {
      headers: httpHeaders
    };
    this.extraHeaders = [];
    return result;
  }

  // error handling
  private handleError(error: HttpErrorResponse, ctxt, autoCatchError) {
    this.busyService.hide();
    this.resetParams();
    let isSystemError = false;

    let message = '';
    if (error.error !== undefined && error.error !== null) {
      if (error.error.message !== undefined) {
        message = error.error.message;
        if (error.error['systemerror']) {
          isSystemError = error.error['systemerror'];
        }
      } else {
        message = error.message;
      }
    } else {
      message = error.message;
    }
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + 'error was:',
        error
      );
    }

    // showing the error message always over the messageService
    if (autoCatchError) {
      if (isSystemError) {
        ctxt.messageService.showStickyError(this.sanitizeErrorMessage(message));
      } else {
        if (error instanceof Warning) {
          ctxt.messageService.showWarning(this.sanitizeErrorMessage(message));
        } else {
          ctxt.messageService.showError(this.sanitizeErrorMessage(message));
        }
      }
    }
    // return an ErrorObservable with a user-facing error message
    return throwError(message);
  }

  protected sanitizeErrorMessage(message: string): string {
    return message;
  }

  private handleBusyStart() {
    if (this.showBusyForNextAction) {
      this.busyService.show();
    }
  }

  private handleBusyEnd() {
    if (this.showBusyForNextAction) {
      this.busyService.hide();
      this.showBusyForNextAction = false;
    }
  }

  public showBusy() {
    this.showBusyForNextAction = true;
    return this;
  }

  public noAutoCatchError() {
    this.autoCatchError = false;
    return this;
  }

  protected getFullUrl(actionPath = null): string {
    if (actionPath === null) {
      actionPath = this.actionPath;
    }
    let fullUrl = this.getBaseUrl() + actionPath;
    let queryParams = this.queryParams;
    if (this.getQueryParamsFromDecorator() !== undefined) {
      queryParams = this.queryParams.concat(this.getQueryParamsFromDecorator());
    }

    this.urlParams.map((param: UrlParam) => {
      const regex = new RegExp(':' + param.name);
      if (param.value === undefined) {
        console.error('Error: UrlParam "' + param.name + '" is undefined!');
      } else {
        const val = param.value === null ? '' : param.value.toString();
        fullUrl = fullUrl.replace(regex, val);
      }
    });

    fullUrl = this.removeLastSlash(fullUrl);

    queryParams.map((param: QueryParam, i) => {
      let value;

      if (isObject(param.value)) {
        value = encodeURIComponent(JSON.stringify(param.value));
      } else {
        value = encodeURIComponent(param.value.toString());
      }
      fullUrl += (i === 0 ? '?' : '&') + param.name + '=' + value;
    });

    this.resetParams();
    return fullUrl;
  }

  private removeLastSlash(url: string) {
    return url.replace(/\/$/, '');
  }

  private resetParams(): void {
    this.queryParams.length = 0;
    this.urlParams.length = 0;
  }

  set actionPath(path: string) {
    this._actionPath = path;
  }

  get actionPath(): string {
    return this.formatActionPath(this._actionPath);
  }

  // functions used in decorators
  public getBaseUrl(): string {
    if (this.baseUrl) {
      const result = this.baseUrl;
      this.baseUrl = null;
      return result;
    } else {
      return this.getBaseUrlFromDecorator();
    }
  }

  public getBaseUrlFromDecorator(): string {
    return '';
  }

  protected getQueryParamsFromDecorator(): Array<QueryParam> {
    return;
  }

  // helper functions
  private formatActionPath(path: string = ''): string {
    if (path !== '') {
      return '/' + path.replace(/^\//, '').replace(/\/$/, '');
    } else {
      return '';
    }
  }
}
