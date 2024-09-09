import { SettingsService } from './settings.service';
import { FileData } from '../models/entities/file-data';
import { UserInfoService } from './user-info.service';
import { ServicesProviderService } from './services-provider.service';
import { CookieService } from 'ngx-cookie';
import { FormData } from '../models/entities/form-data';
import { RecordItemData } from '../models/entities/record-item-data';
import { TokenResult } from '../models/entities/token-result';
import { Record } from '../models/entities/record';
import { Injectable } from '@angular/core';
import { RestClient, BaseUrl, Path } from '../libs/rest-client';
import { HttpClient } from '@angular/common/http';
import { BusyService } from './busy.service';
import { MessageUtilService } from './message-util.service';
import { environment } from 'src/environments/environment';
import { CustomRecordFormData } from '../models/entities/custom-record-form-data';
import { Menu } from '../models/entities/menu';
import { Group } from '../models/entities/group';
import { FormFieldType } from '../models/entities/form-field-type';
import { FormMetaField } from '../models/entities/form-meta-field';
import { plainToClass } from 'class-transformer';
import 'reflect-metadata';
import { FormMetaFieldFactory } from '../models/entities/form-meta-field-factory';
import { RecordItem } from '../models/entities/record-item';
import { RecordFormInfo } from '../models/entities/record-form-info';
import { FormSection } from '../models/entities/form-section';
import { RecordFormData } from '../models/entities/record-form-data';
import { FormColumn } from '../models/entities/form-column';
import { FilterParam } from '../libs/filter-param';
import { RecordItems } from '../models/entities/record-items';

@Injectable({
  providedIn: 'root'
})
@BaseUrl(environment.apiUrl)
export class ApiService extends RestClient {

  private token: string = null;
  private locale = 'en_US';
  constructor(http: HttpClient,
              busyService: BusyService,
              messageService: MessageUtilService,
              private servicesProviderService: ServicesProviderService,
              private cookieService: CookieService,
              private userInfoService: UserInfoService,
              private settingsService: SettingsService) {
    super(http, busyService, messageService);
  }

  public async init() {
    // this.tokenResult = await this.getToken();
  }

  public beforeAction() {
    const token = this.getToken();
    this.addHeader('Authorization', 'Bearer ' + token);
  }


  /** --- User and authentication --- */

  public async login(username: string, password: string) {
    this.noAutoCatchError();
    const tokenResult = await this.getTokenResultFromBackend(username, password);
    this.setUserInfo(tokenResult);
    this.settingsService.initialize();

    if (tokenResult) {
      this.token = tokenResult.Token;
      return true;
    } else {
      return false;
    }
  }

  public async reloadUserSettings(datastoreSlug: string) {
    const tokenResult: TokenResult = await this.getUserSettings(datastoreSlug);
    this.userInfoService.updateSettings(tokenResult.Settings);
  }

  @Path('DataStore/:datastoreSlug')
  public getUserSettings(datastoreSlug: string): Promise<TokenResult> {
    return this.setUrlParam({datastoreSlug}).get();
  }

  public getToken(): string {
    if (!this.token) {
      this.token = this.cookieService.get('token');
    }

    return this.token;
  }

   public getLocale(): string {
    if (!this.locale && this.cookieService.get('locale')) {
        this.locale = this.cookieService.get('locale');
    }

    return this.locale;
  }

  public logout() {
    this.token = null;
  }

  private getTokenResultFromBackend(username: string, password: string): Promise<TokenResult> {
    const data = {
      Fields: {
        Email: username,
        Password: password
      }
    };
    const result = this.post<TokenResult>(data, true, 'auth/getToken', false).catch((error) => {
      return null;
    });

    return result;
  }

  public setUserInfo(user) {
    this.userInfoService.setUserInfo(user);
  }

  public getUserInfo() {
    return this.userInfoService.getUserInfo();
  }

  @Path('auth/checkemail')
  public checkEmail(email: string): Promise<string> {
    const result = this.addQueryParam('Email', email).get<string>();
    return result;
  }

  @Path('auth/checkautologintoken')
  public checkAuthLoginToken(slug: string, token: string): Promise<string> {
    const result = this.addQueryParam('Slug', slug).addQueryParam('Token', token).post<string>();
    return result;
  }

  public resetPassword(token: string, slug: string, password: string): Promise<any> {
    const data = {
      Fields: {
        Password: password,
        Slug: slug
      }
    };
    const result = this.post<TokenResult>(data, true, 'auth/resetpassword/' + '?apitoken=' + token, false).catch((error) => {
      return '';
    });

    return result;
  }

  @Path('auth/validatepassword')
  public validatePassword(email: string, oldPassword: string, password: string): Promise<string> {
    const result = this.addQueryParam('Fields', '{Email=' + email + ',OldPassword=' + oldPassword + ',Password=' + password + '}')
      .post<string>();
    return result;
  }

  @Path('auth/checkpassword')
  public currentUserCheckOldPassword(email: string, oldPassword: string) {
    return this.addQueryParam('Fields', `{Email=${email},OldPassword=${oldPassword}}`).post();
  }

  @Path('auth/changepassword')
  public changePassword(email: string, oldPassword: string, password: string): Promise<string> {
    this.beforeAction();
    const result =
      this.addQueryParam('Fields', '{Email=' + email + ',OldPassword=' + oldPassword + ',Password=' + password + '}').post<string>();
    return result;
  }

  @Path('Member/:userSlug/Permissions')
  public getUserPermissions(userSlug: string) {
    return this.setUrlParam({ userSlug }).get();
  }


  /** --- Record --- */

  @Path('Record')
  public getRecords(): Promise<Record[]> {
    return this.get<Record[]>();
  }

  @Path('custom/CustomRecordSet/getRecords')
  public getRecordsTitleAndSlugOnly(): Promise<any[]> {
    return this.get<any[]>();
  }

  @Path('Note')
  public addRecordItemNote(note): Promise<any> {
    return this.post(note);
  }

  @Path('Note')
  public getRecordItemNotes(recordItemSlug: string): Promise<any> {
    const filter = new FilterParam();
    filter.addValue('RecordSetItem.Slug', recordItemSlug);
    this.addFilterParam(filter);
    return this.get();
  }

  @Path('Note/:noteSlug')
  public deleteRecordItemNote(noteSlug): Promise<any> {
    return this.setUrlParam({ noteSlug }).delete();
  }

  @Path('Record/:recordSlug')
  public getRecordVersions(recordSlug: string, version): Promise<any> {
    return this.setUrlParam({ recordSlug }).addQueryParam('Version', version).get();
  }

  @Path('Record/:recordSlug')
  public rollbackRecord(recordSlug: string, version): Promise<any> {
    return this.setUrlParam({ recordSlug }).addQueryParam('Version', version).addQueryParam('Rollback', 'recursiv').get();
  }

  @Path('RecordItem/:recordItemSlug')
  public rollbackRecordItem(recordItemSlug: string, version): Promise<any> {
    return this.setUrlParam({ recordItemSlug }).addQueryParam('Version', version).addQueryParam('Rollback', 'recursiv').get();
  }

  @Path('custom/CustomRecordSet/getRecordFormData/:recordSlug')
  public showRecordVersion(recordSlug: string, version: string = null, translateLabels: string = null): Promise<any> {
     return this.setUrlParam({ recordSlug }).addQueryParam('translateLabels', translateLabels).addQueryParam('Version', version).get();
  }

  @Path('Record/:recordSlug/getLabels')
  public getRecordFieldLabels(recordSlug: string): Promise<[]> {
    return this.setUrlParam({ recordSlug }).addQueryParam('Length', 1000).get();
  }

  @Path('Record/:recordSlug/getActiveLabels')
  public getRecordFieldActiveLabels(recordSlug: string): Promise<[]> {
    return this.setUrlParam({ recordSlug }).addQueryParam('Length', 1000).get();
  }

  @Path('Record/:recordSlug')
  public deleteRecord(recordSlug: string) {
    return this.setUrlParam({ recordSlug }).delete();
  }

  @Path('custom/CustomRecordSet/getRecordFormData/:slug')
  public getRecordFormData(slug: string,
                           itemSlug: string = null,
                           recordVersion: string = null,
                           recordItemVersion: string = null,
                           translateLabels: string = null ): Promise<CustomRecordFormData> {
    this.setUrlParam({ slug });
    if (itemSlug !== null) {
      this.addQueryParam('itemSlug', itemSlug);
    }

    if (recordVersion !== null) {
      this.addQueryParam('recordVersion', recordVersion);
    }

    if (recordItemVersion !== null) {
          this.addQueryParam('recordItemVersion', recordItemVersion);
    }

    if (translateLabels !== null) {
          this.addQueryParam('translateLabels', translateLabels);
    }

    return this.get<CustomRecordFormData>().then(
      formData => {
        const formDataAsClass = this.convertCustomRecordFormDataPlainToClass(formData);
        formDataAsClass.processAfterLoad();
        return formDataAsClass;
      });
  }

  @Path('custom/CustomRecordSet/setRecordFormData/:recordSlug')
  public postRecordFormData(recordSlug: string, recordFormData: CustomRecordFormData) {
    return this.setUrlParam({ recordSlug }).post<string>(recordFormData);
  }

  @Path('custom/CustomDataExporter/exportRecordData/:recordSlug')
  public exportRecordData(recordSlug: string, data: any) {
    return this.setUrlParam({ recordSlug }).post<string>(data);
  }

  @Path('custom/CustomDataExporter/exportModelData/:modelName')
  public exportModelData(modelName: string, data: any) {
    return this.setUrlParam({ modelName }).post<string>(data);
  }

  @Path('Group')
  public getGroups(): Promise<Group[]> {
    return this.get<Group[]>();
  }

  @Path('Member')
  public getMembers(): Promise<any[]> {
    return this.get<any[]>();
  }

  @Path('FormFieldType')
  public getFormFieldTypes(): Promise<FormFieldType[]> {
    return this.get<FormFieldType[]>();
  }


  /** --- Record items --- */

  @Path('custom/CustomRecordSet/initRecordItem/:recordSlug')
  public createRecordItem(recordSlug: string) {
    return this.setUrlParam({ recordSlug }).get<string>();
  }

  @Path('custom/CustomRecordSet/setRecordItem/:itemSlug')
  public postRecordItem(itemSlug: string, recordItem: RecordItem) {
    return this.setUrlParam({ itemSlug }).post<any>(recordItem);
  }

/*
  @Path('custom/CustomRecordSet/printRecordItem/:itemSlug')
  public printRecordItem(itemSlug: string, templateSlug: string, data: any) {
    return this.setUrlParam({ itemSlug }).addQueryParam('templateSlug', templateSlug).get<string>(data);
  }
  */
   @Path('custom/CustomRecordSet/printRecordItem/:itemSlug')
  public printRecordItem(itemSlug: string, templateSlug: string) {
    return this.setUrlParam({ itemSlug }).addQueryParam('templateSlug', templateSlug).get<string>(true);
  }

  @Path('custom/CustomRecordSet/getRecordItems/:recordSlug')
  public getRecordItems(
    recordSlug: string,
    page: number = 0,
    count: number = 100,
    sortColumn: string = '',
    sortOrder: number = 1,
    searchTerm = null,
    recordItemSlugs: string[] = [],
    dateFrom: string = null,
    dateTo: string = null,
  ): Promise<RecordItems> {
    if (recordSlug){
      this.setUrlParam({ recordSlug });
      this.addQueryParam('Page', page);
      this.addQueryParam('Length', count);
      this.addQueryParam('OrderColumn', sortColumn);
      this.addQueryParam('OrderOpt', this.getOrderOptFromSortOrder(sortOrder));
      const filter = new FilterParam();

      if (searchTerm !== null && searchTerm.length > 0) {
        filter.addValue('ItemData.Value:PartialMatch', searchTerm);
      }

      if (recordItemSlugs.length > 0) {
        filter.addValues('Slug', recordItemSlugs);
      }

      if (dateFrom !== null) {
        filter.addValue('Created:GreaterThanOrEqual', dateFrom);
      }

      if (dateTo !== null) {
        filter.addValue('Created:LessThanOrEqual', dateTo);
      }

      this.addFilterParam(filter);
      return this.get<RecordItems>().then(
        recordItems => {
          const formDataAsClass = this.convertRecordFormDataPlainToClass(recordItems.Record);
          recordItems.Record = formDataAsClass;
          return recordItems;
        });
    }
  }

  @Path('RecordItem')
  public getRecordItemsFromList(
    recordSlug: string,
    recordItemSlugs: string[],
    sortColumn: string = '',
    sortOrder: number = 1,
    searchTerm = null,
  ): Promise<RecordItemData[]> {
    this.addQueryParam('OrderColumn', sortColumn);
    this.addQueryParam('OrderOpt', this.getOrderOptFromSortOrder(sortOrder));

    const filter = new FilterParam()
      .addRecordSlug(recordSlug);

    if (searchTerm !== null && searchTerm.length > 0) {
      filter.addValue('ItemData.Value', searchTerm);
    }

    if (recordItemSlugs.length > 0) {
      filter.addValues('Slug', recordItemSlugs);
    }

    this.addFilterParam(filter);
    return this.get<RecordItemData[]>();
  }

  @Path('RecordItem/CountItems')
  public getRecordItemsCount(recordSlug: string): Promise<number> {
    return this.addFilterParam(
        new FilterParam()
          .addRecordSlug(recordSlug)).get<number>();
  }

  @Path('RecordForm')
  public getRecordFormInfo(recordSlug: string): Promise<RecordFormInfo[]> {
    return this.addFilterParam(new FilterParam().addRecordSlug(recordSlug)).get<RecordFormInfo[]>();
  }

  @Path('RecordItem/:recordItemSlug')
  public getRecordItem(recordItemSlug: string, recordItemVersion: string = null): Promise<RecordItemData> {
    if (recordItemVersion !== null) {
        return this.setUrlParam({ recordItemSlug }).addQueryParam('Version', recordItemVersion).get<RecordItemData>();
    } else {
        return this.setUrlParam({ recordItemSlug }).get<RecordItemData>();
    }
  }

  @Path('RecordItem/:recordItemSlug')
  public deleteRecordItem(recordItemSlug: string, deletionType: string = 'logically') {
    return this.setUrlParam({ recordItemSlug }).addQueryParam('DeleteType', deletionType).delete();
  }

  @Path('RecordItemData')
  public putRecordItemFieldValue(recordItemSlug: string, formFieldSlug: string, value: any) {
    const filter: FilterParam = new FilterParam()
      .addRecordItemSlug(recordItemSlug)
      .addFormFieldSlug(formFieldSlug);

    const valObj: {} = {};
    valObj['Value'] = value;

    this.addFilterParam(filter).put({ Fields: valObj });
  }

  @Path('RecordItem/:recordItemSlug/getPrevNextItems')
  public getPrevAndNextRecordItem(recordItemSlug: string): Promise<any> {
    return this.setUrlParam({ recordItemSlug }).get();
  }

@Path('custom/CustomRecordSet/getSummableItems/:recordSlug')
  public getSummableItems(
    recordSlug: string,
    searchTerm = null,
    dateFrom: string = null,
    dateTo: string = null, ): Promise<any>{

    if (recordSlug){
      this.setUrlParam({ recordSlug });
      const filter = new FilterParam();

      if (searchTerm !== null && searchTerm.length > 0) {
            filter.addValue('ItemData.Value:PartialMatch', searchTerm);
      }

      if (dateFrom !== null) {
        filter.addValue('Created:GreaterThanOrEqual', dateFrom);
      }

      if (dateTo !== null) {
        filter.addValue('Created:LessThanOrEqual', dateTo);
      }

      this.addFilterParam(filter);
      return this.get();
    }
  }

  @Path('RecordItem/:itemSlug/doCopy')
  public copyRecordItem(recordSlug: string, itemSlug: string): Promise<any> {
    return this.setUrlParam({recordSlug}).setUrlParam({itemSlug}).get();
  }


  /** --- Admin Models --- */

  @Path('custom/CustomCore/getAllowedModelNames')
  public getModelNamesAllowedForUserSelection(): Promise<any> {
    return this.get();
  }

  @Path(':modelName')
  public getModelItems( modelName: string,
                        page: number = 1,
                        count: number = 100,
                        sortColumn: string = '',
                        sortOrder: number = 1,
                        searchTerm = null,
                        modelItemSlugs: string[] = []): Promise<[]> {
    this.addQueryParam('Page', page);
    this.addQueryParam('Length', count);
    this.addQueryParam('OrderColumn', sortColumn);
    this.addQueryParam('OrderOpt', this.getOrderOptFromSortOrder(sortOrder));

    const filter = new FilterParam();
    if (searchTerm !== null && searchTerm.length > 0) {
      filter.addValue('searchAll', searchTerm);
    }

    if (modelItemSlugs.length > 0) {
      filter.addValues('Slug', modelItemSlugs);
    }

    this.addFilterParam(filter);
    return this.setUrlParam({ modelName }).get();
  }

  @Path(':modelName')
  public getModelItemsFromList(
                        modelName: string,
                        modelItemSlugs: string[],
                        sortColumn: string = '',
                        sortOrder: number = 1,
                        searchTerm = null): Promise<[]> {
    this.addQueryParam('OrderColumn', sortColumn);
    this.addQueryParam('OrderOpt', this.getOrderOptFromSortOrder(sortOrder));

    const filter = new FilterParam();
    if (searchTerm !== null && searchTerm.length > 0) {
      filter.addValue('searchAll', searchTerm);
    }

    if (modelItemSlugs.length > 0) {
      filter.addValues('Slug', modelItemSlugs);
    }

    this.addFilterParam(filter);
    return this.setUrlParam({ modelName }).get();
  }

  @Path(':modelName/getFormFields')
  public getFormFieldsForModel(modelName: string): Promise<FormData> {
    return this.setUrlParam({ modelName }).get<FormData>().then(
      formData => {
        formData = plainToClass(FormData, formData);
        formData.Sections = this.convertFormDataSectionsPlainToClass(formData.Sections);
        return formData;
      });
  }

  @Path(':modelName/:itemSlug')
  public getModelItem(modelName: string, itemSlug: string) {
    return this.setUrlParam({modelName}).setUrlParam({itemSlug}).get();
  }

  @Path(':modelName/:itemSlug/getFormFields')
  public getFormFieldsForModelObject(modelName: string, itemSlug?: string): Promise<FormData> {
    this.setUrlParam({ modelName });
    if (itemSlug !== undefined) {
      this.setUrlParam({ itemSlug });
    } else {
      this.setUrlParam('itemSlug', 'null');
    }

    return this.get<FormData>().then(
      formData => {
        formData = plainToClass(FormData, formData);
        formData.Sections = this.convertFormDataSectionsPlainToClass(formData.Sections);
        return formData;
      });
  }

  @Path(':modelName/:itemSlug')
  public putModelObject(modelName: string, itemSlug: string, modelData: any) {
    if (modelData !== null){
        return this.setUrlParam({ modelName }).setUrlParam({ itemSlug }).put(modelData);
    }
  }

  @Path(':modelName/')
  public postModelItem(modelName: string, modelData: any) {
    return this.setUrlParam({ modelName }).post(modelData);
  }

  @Path(':modelName/:itemSlug/doCopy')
  public copyModelItem(modelName: string, itemSlug: string): Promise<any> {
    return this.setUrlParam({modelName}).setUrlParam({itemSlug}).get();
  }

  @Path(':modelName/CountItems')
  public getModelItemsCount(modelName: string, searchTerm = null): Promise<number> {

    const filter = new FilterParam();
    if (searchTerm !== null && searchTerm.length > 0) {
      filter.addValue('searchAll', searchTerm);
      this.addFilterParam(filter);
    }
    return this.setUrlParam({ modelName }).get<number>();
  }

  @Path(':modelName/summaryFields')
  public getModelSummaryFields(modelName: string) {
    return this.setUrlParam({ modelName }).get();
  }

  @Path(':modelName/:itemSlug')
  public deleteModelItem(modelName: string, itemSlug: string) {
    return this.setUrlParam({ modelName }).setUrlParam({ itemSlug }).delete();
  }

  /* @Path(':modelName/:itemSlug/getPrevNextItems')
  public getPrevAndNextModelItem(modelName: string, itemSlug: string): Promise<any> {
    return this.setUrlParam({ modelName }).setUrlParam({ itemSlug }).get();
  }*/

  @Path('File/:fileSlug')
  public deleteFile(fileSlug: string) {
    return this.setUrlParam({ fileSlug }).addQueryParam('DeleteType', 'physically').delete();
  }

  /** --- WorkFlow --- */

  @Path('EveryWorkflowDefinition')
  public getEveryWorkflowDefinition() {
    return this.get<any>();
  }

  @Path('EveryWorkflowDefinition/:Slug/getTasks')
  public findByIdEveryWorkflowDefinition(
    Slug: string = '',
    taskStatus: string = 'Unseen',
    page = 1,
    count = 100,
    searchTerm: string = '',
    createdFrom: string = '',
    createdTo: string = '',  ) {
     this.setUrlParam({ Slug });
    // this.addQueryParam('TaskStatus', taskStatus)
     this.addQueryParam('OrderColumn', 'Created');
     this.addQueryParam('OrderOpt', 'ASC');
     this.addQueryParam('Page', page);
     this.addQueryParam('Length', count);
     if (searchTerm !== null) { this.addQueryParam('searchTerm', searchTerm); }
     if (searchTerm !== null) { this.addQueryParam('createdFrom', createdFrom); }
     if (searchTerm !== null) { this.addQueryParam('createdTo', createdTo); }

     if (taskStatus === 'Seen') {
         this.addQueryParam('TaskStatus', 'Unseen');
     }else{
        this.addQueryParam('TaskStatus', taskStatus);
    }

     return this.get<any>();
  }

    @Path('custom/EveryWorkflowCustomFnc/countTasks/:Slug')
     public getTasksCount(Slug: string = '', taskStatus: string = 'Unseen') {
         this.setUrlParam({ Slug });
         this.addQueryParam('TaskStatus', taskStatus);
         return this.get<any>();
      }

  @Path('EveryWorkflowTask/:Slug')
  public deleteTask(Slug) {
    return this.setUrlParam({ Slug }).delete<any>();
  }

  @Path('EveryWorkflowTask/:Slug')
  public getTask(Slug: string) {
    return this.setUrlParam({ Slug }).get<any>();
  }

  @Path('EveryWorkflowTask/:Slug')
  public updateTask(Slug: string, data: any) {
    return this.setUrlParam({ Slug }).put<any>(data);
  }

  /** --- Menus --- */

  @Path('Menu')
  public getPrimaryMenu(): Promise<Menu[]> {
    const result = this.addQueryParam('Filter', '{AdminMenu=0,UserMenu=0,ParentID=0,Active=1}').get<Menu[]>();
    return result;
  }

  @Path('Menu')
  public getAdminMenu(): Promise<Menu[]> {
    const result = this.addQueryParam('Filter', '{AdminMenu=1,UserMenu=0,ParentID=0,Active=1}').get<Menu[]>();
    return result;
  }

  @Path('Menu')
  public getUserMenu(): Promise<Menu[]> {
    const result = this.addQueryParam('Filter', '{AdminMenu=0,ParentID=0,UserMenu=1}').get<Menu[]>();
    return result;
  }


  // --- private methods ---

  private convertCustomRecordFormDataPlainToClass(formData: CustomRecordFormData): CustomRecordFormData {
    formData = plainToClass(CustomRecordFormData, formData);
    formData.Record = plainToClass(RecordFormData, formData.Record);

    formData.Record.Sections = this.convertFormDataSectionsPlainToClass(formData.Record.Sections);
    return formData;
  }

  private convertRecordFormDataPlainToClass(formData: RecordFormData): RecordFormData {
    formData = plainToClass(RecordFormData, formData);

    formData.Sections = this.convertFormDataSectionsPlainToClass(formData.Sections);
    return formData;
  }

  private convertFormDataSectionsPlainToClass(formDataSections: FormSection[]): FormSection[] {
    formDataSections.forEach(section => {
      if (Array.isArray(section.Columns)) {
        section.Columns.forEach(column => this.convertColumnPlainToClass(column));
      } else {
        section.Columns = [this.convertColumnPlainToClass(section.Columns)];
      }
    });
    return formDataSections;

  }

  private convertColumnPlainToClass(column: FormColumn): FormColumn {
    column.Fields.forEach((metaField: FormMetaField, index) => {
      column.Fields[index] = FormMetaFieldFactory.createFromAPIobject(metaField, this.servicesProviderService);
    });
    return column;
  }

  private getOrderOptFromSortOrder(sortOrder: number) {
    return (sortOrder > 0) ? 'ASC' : 'DESC';
  }

  // --- Plugin Method ---

  @Path('Record/:recordItemSlug/getLabels')
  public getFieldItem(recordItemSlug: string): Promise<any> {
    return this.setUrlParam({ recordItemSlug }).get<any>();
  }

  // --- Dashboard Widget---

  @Path('EveryWidget')
  public getEveryWidget(): Promise<any> {
    const result = this.addQueryParam('Filter', '{Active=1}').get<any>();
    return result;
  }

  // --- App ---

  @Path('custom/CustomApp/installFreeApp/:appSlug')
  public installFreeApp(appSlug: string): Promise<any> {
    return this.setUrlParam({ appSlug }).get();
  }

  @Path('custom/CustomApp/deinstallApp/:appSlug')
  public deinstallApp(appSlug: string): Promise<any> {
    return this.setUrlParam({ appSlug }).get();
  }

  // --- File manager ---

  @Path('custom/CustomAsset/getFile')
  public getFileData(fileSlug: string): Promise<FileData> {
    return this.addQueryParam('slug', fileSlug).get();
  }

  @Path('custom/CustomAsset/editFile')
  public postEditFileData(fileData: FileData, folderSlug: string = null) {
    this.addFormDataParam('fileName', fileData.Name)
      .addFormDataParam('fileTitle', fileData.Title)
      .addFormDataParam('fileSlug', fileData.Slug)
      .addFormDataParam('fileCanViewType', fileData.CanViewType)
      .addFormDataParam('fileCreated', fileData.Created)
      .addFormDataParam('fileLastEdited', fileData.LastEdited)
      .addFormDataParam('fileCreatedBy', fileData.CreatedBy)
      .addFormDataParam('fileUpdatedBy', fileData.UpdatedBy)
      .addFormDataParam('fileFilename', fileData.Filename)
      .addFormDataParam('fileLink', fileData.Link);
    if (folderSlug !== null) {
      this.addFormDataParam('fileFolderSlug', folderSlug);
    }
    if (fileData.ViewerGroupSlugs && (fileData.ViewerGroupSlugs.length > 0)) {
      fileData.ViewerGroupSlugs.forEach(slug => {
      this.addFormDataParam('fileViewerGroups[]', slug);
      });
    }
    if (fileData.EditorGroupSlugs && (fileData.EditorGroupSlugs.length > 0)) {
      fileData.EditorGroupSlugs.forEach(slug => {
        this.addFormDataParam('fileEditorGroups[]', slug);
      });
    }

    return this.post();
  }

  @Path('custom/CustomAsset/addNote')
  public postAddNoteToFile(fileSlug: string, noteContent: string) {
    return this
      .addFormDataParam('fileSlug', fileSlug)
      .addFormDataParam('noteContent', noteContent)
      .post();
  }

  @Path('custom/CustomAsset/deleteNote')
  public postDeleteNote(noteSlug: string) {
    return this.addFormDataParam('slug', noteSlug).post();
  }

  @Path('custom/CustomAsset/getFolderTree')
  public getFolderTree(folderSlug: string, itemSlug: string) {
    return this
      .addFormDataParam('currentFolder', folderSlug)
      .addFormDataParam('itemSlug', itemSlug)
      .post();
  }

  @Path('custom/CustomAsset/getFolderFiles')
  public getFolderFiles(currentFolderSlug: string,
                        itemSlug: string,
                        length: number,
                        start: number,
                        createdFrom: string,
                        createdTo: string) {
    return this
      .addFormDataParam('currentFolderSlug', currentFolderSlug)
      .addFormDataParam('itemSlug', itemSlug)
      .addFormDataParam('length', length)
      .addFormDataParam('start', start)
      .addFormDataParam('createdFrom', createdFrom)
      .addFormDataParam('createdTo', createdTo)
      .post();
  }

  @Path('custom/CustomAsset/uploadFiles')
  public postUploadFiles(currentFolderSlug: string, files: any[]) {
    files.forEach(file => {
      this.addFormDataParam('files[]', file);
    });
    this.addFormDataParam('currentFolderSlug', currentFolderSlug);
    return this.post();
  }

  @Path('custom/CustomAsset/setFolder')
  public postSetFolder(
        folderName: string,
        folderSlug: string,
        currentFolderSlug: string,
        itemSlug: string,
        folderParentSlug: string = null) {
    this
      .addFormDataParam('folderName', folderName)
      .addFormDataParam('folderSlug', folderSlug)
      .addFormDataParam('currentFolderSlug', currentFolderSlug)
      .addFormDataParam('itemSlug', itemSlug);
    if (folderParentSlug !== null) {
      this.addFormDataParam('folderParentSlug', folderParentSlug);
    }

    return this.post();
  }

  @Path('custom/CustomAsset/deleteFiles')
  public postDeleteFiles(items: any[], deleteType: string) {
    items.forEach(item => {
      this.addFormDataParam('items[]', item);
    });
    this.addFormDataParam('deleteType', deleteType);
    return this.post();
  }

  // --- Homepage ---
  @Path('HomePage')
  public getHomepageContent(locale = 'de_DE'): Promise<[]> {
    return this.addFilterParam(new FilterParam().addValue('Locale', locale)).get<[]>();
  }

  @Path('FeaturePage')
  public getHomepageFeaturesContent(locale = 'de_DE'): Promise<[]> {
    return this.addFilterParam(new FilterParam().addValue('Locale', locale)).get<[]>();
  }

  @Path('PricePage')
  public getHomepagePricesContent(): Promise<[]> {
    return this.get<[]>();
  }


  public test(): Promise<any> {
    this.setBaseUrl('http://everydatastore.com/hello.php');
    return this.get<any>();
  }

}
