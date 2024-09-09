import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { NEVER, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { Warning } from '../libs/warning';


@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService,
              private settingsService: SettingsService,
              private translateService: TranslateService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {

      // Demo mode check
      if ((['POST', 'PUT', 'DELETE'].indexOf(req.method) >= 0) && (this.settingsService.isInDemoMode())) {
        // check for exception: these endpoints are a POST, although it should be a GET
        const exceptions = ['getFolderTree', 'getFolderFiles', 'getToken'];
        if (!exceptions.some(e => req.url.includes(e))) {
          return throwError(new Error(this.translateService.instant('saving-not-allowed-in-demo-mode')));
        }
      }

      return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred: ', error.error.message);
            return throwError(new Error('A client-side or network occurred!'));
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
              `Backend returned code ${error.status}, ` +
              `msg: ${error.error}`);
            console.error(error);
            if (error.status === 400 || error.status === 401 || error.status === 403) {
              this.authService.logout().then(() => {
                // tslint:disable-next-line: no-console
                console.info('logged out successfully');
              });
              return throwError(new Error('Auth-error or expired token, please log in again.'));
            } else {
              if (error.status === 404) {
                return throwError(new Error('Resource not found!'));
              }
              return throwError(new Error('An error in the communication with the backend occurred!'));
            }
          }
        } else {
          console.error(error);
          return throwError(new Error(error));
        }
      })
    );

  }
}
