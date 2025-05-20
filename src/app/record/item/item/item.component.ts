import { Hooks, PluginService } from '../../../shared/services/plugin.service';
import { ConfirmationService } from 'primeng/api';
import { SaveType } from '../../../shared/components/save-cancel-buttons/save-cancel-buttons.component';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsService } from 'src/app/shared/services/permissions.service';
import { Permissions } from '../../../shared/services/permissions.service';
import { RoutingService } from '../../../shared/services/routing.service';
import { MessageUtilService } from '../../../shared/services/message-util.service';
import { FieldCollectionService } from '../../../shared/services/field-collection.service';
import { AfterContentChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/shared/services/api.service';
import { BusyService } from 'src/app/shared/services/busy.service';
import { RecordItemData } from 'src/app/shared/models/entities/record-item-data';
import { CustomRecordFormData } from 'src/app/shared/models/entities/custom-record-form-data';
import { FormMode } from 'src/app/form-builder/form-builder.component';
import { FieldType } from 'src/app/shared/models/field-type';
import { FormMetaField } from 'src/app/shared/models/entities/form-meta-field';
import { FieldSettingValues } from 'src/app/shared/models/field-settings/field-setting-values';
import { FieldSettings } from 'src/app/shared/models/field-settings/field-setting';
import { TableData } from 'src/app/shared/models/ressources/table-data';
import { ItemType } from 'src/app/shared/models/ressources/item-type';
import { ItemData } from 'src/app/shared/models/entities/item-data';
import { Location } from '@angular/common';
import { SubRecordItemInfo } from 'src/app/shared/models/entities/record-form-data';
import { HttpClient } from '@angular/common/http';
import { ViewFileDialogComponent } from 'src/app/plugins/file-manager/view-file-dialog/view-file-dialog.component';
import { FileInfo } from 'src/app/shared/models/entities/file-info';
import { LanguageService } from 'src/app/shared/services/language.service';
import * as saveAs from 'file-saver';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';


interface TabData {
  label: string;
  field: FormMetaField;
  data: any;
  hasMany: boolean;
  itemType?: ItemType;
  recordSlug?: string;
  modelName?: string;
}

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit, AfterContentChecked, OnDestroy {

  @ViewChild('viewFileDialog')
  viewFileDialog: ViewFileDialogComponent;

  public FormModeEnum = FormMode;
  public fieldCollectionService: FieldCollectionService;

  recordFormData: CustomRecordFormData;
  recordItemData: RecordItemData;
  recordItemSlug: string;
  recordItemFolderSlug: string;
  recordSlug: string;
  recordTitle: string;

  subRecordItemsInfo: SubRecordItemInfo[] = [];

  editMode = false;
  isNewItem = false;
  formIsBuilt = false;
  clickedEditBtnInViewMode = false;
  isQuickAddForm = false;
  canCancel = true;
  visableMain = true;
  visibleFileManager = false;
  listpage = null;
  data: any[];
  navInfo: [] = [];
  user: any;
  token: string;
  permissions: Permissions = new Permissions();
  isCalendarRecordSet = false;
  dialogVisible = true;
  dashboardPath: string;

  recordItemVersion: string;
  public versions: any[];
  public notes: any[];
  public type: string;
  public task: string;
  public langDir: string;
  public WORKFLOW = 'workflow';
  public openDeleteCheckModal = false;
  public openEditModal = false;
  public pdfTemplateNames: any[];
  public printButtonItems: any[];
  public pdfURL: string;

  // tabs
  tabs: TabData[] = [];
  dataTabs: {} = {};

  public activeIndex: any;

  constructor(private route: ActivatedRoute,
              private apiService: ApiService,
              private busyService: BusyService,
              private messageService: MessageUtilService,
              private changeDetector: ChangeDetectorRef,
              private routingService: RoutingService,
              private location: Location,
              private permissionsService: PermissionsService,
              private confirmationService: ConfirmationService,
              private translateService: TranslateService,
              private languageService: LanguageService,
              private http: HttpClient,
              private pluginService: PluginService,
              public dialogRef: DynamicDialogRef,
              public dialogConfig: DynamicDialogConfig) {
    this.fieldCollectionService = new FieldCollectionService();
    this.dashboardPath = routingService.getDashboardPath();
    this.pluginService.subscribe(Hooks.OnReloadActualRecordItem, this, async () => {
      this.loadItem();
    });

  }

  ngOnDestroy(): void {
    this.pluginService.unsubscribe(Hooks.OnReloadActualRecordItem, this);
  }

  async ngOnInit() {
    this.langDir = this.languageService.getLangDir();
    this.permissions = await this.permissionsService.getPermissionsForModel('RecordItem');
    this.user = await this.apiService.getUserInfo();

    if ((this.dialogConfig.data?.itemSlug) && (this.dialogConfig.data?.recordSlug)) {
        
      this.editMode = true;
      this.isQuickAddForm = true;
      this.recordItemSlug = this.dialogConfig.data.itemSlug;
      await this.loadRecordItem(this.recordItemSlug);
    } else {
      const editModeParam = this.route.snapshot.data['mode'];
      this.editMode = (editModeParam !== undefined && editModeParam === 'edit');
      await this.loadItem();
    }
  }

  async loadItem() {
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.task = this.route.snapshot.queryParamMap.get('task');

    this.route.params.subscribe(async params => {
      this.recordItemSlug = params['itemSlug'];
      this.recordItemVersion = params['recordItemVersion'];
      if (this.recordItemSlug) {
        await this.loadRecordItem(this.recordItemSlug, this.recordItemVersion);
        this.token = this.apiService.getToken();
      }
    });
  }

  ngAfterContentChecked(): void {
    // this.changeDetector.detectChanges();
  }

  public get isDialogVisible(): boolean {
    return this.dialogVisible;
  }

  public set isDialogVisible(val: boolean) {
    this.dialogVisible = val;
    this.onCancelClicked();
  }

  async loadRecordItem(recordItemSlug: string, recordItemVersion: string = null) {

    this.busyService.show();
    this.data = [];

    // TODO this call is only done for getting the recordSlug; we could remove it if getRecordFormData would accept recordItemSlug only
    this.recordItemData = await this.apiService.getRecordItem(recordItemSlug, recordItemVersion);
    this.recordSlug = this.recordItemData.Record.Slug;
    this.versions = this.recordItemData.versionHistory;
    this.pdfTemplateNames = this.recordItemData.PDFTemplateNames;
    this.notes = this.recordItemData.Notes;
    this.recordItemFolderSlug = this.recordItemData.Folder.Slug;
    this.recordFormData = await this.apiService.getRecordFormData(this.recordSlug, recordItemSlug, null, recordItemVersion);
    this.recordTitle = this.recordFormData.Record.Title;

    this.navInfo = await this.apiService.getPrevAndNextRecordItem(recordItemSlug);
    this.subRecordItemsInfo = (this.recordFormData.Record.RecordItems !== null) ? this.recordFormData.Record.RecordItems : [];
    this.subRecordItemsInfo = (this.recordFormData.Record.RecordItems !== null) ? this.recordFormData.Record.RecordItems : [];
    this.visibleFileManager = (this.recordFormData.Record.AllowUpload === 1);

    this.canCancel = true;

    if (this.recordItemData.ItemData.length > 0) {
      this.data = this.createDataForRecordItemTableView(this.recordFormData.getFormMetaFields(), this.recordItemData);
      this.createDataForTabs();
    } else {
      // new record
      this.isNewItem = true;
      this.editMode = true;
      this.canCancel = false;
    }

    const printItems = [];
    if (this.pdfTemplateNames) {
      for (const pdfTemplateName of this.pdfTemplateNames) {
        printItems.push({
          label: pdfTemplateName.Title,
          command: () => {
            this.printPDF(pdfTemplateName.Slug);
          }
        });
      }
    }

    this.printButtonItems = printItems;

    this.busyService.hide();

    if (this.task && this.recordItemData.WorkflowTasks.length > 0) {
      this.setTaskAsSeen(this.recordItemData.WorkflowTasks, this.task, this.apiService);
    }
    
    this.isCalendarRecordSet = this.recordSlug === this.user.Settings.CalendarRecordSlug ? true : false;

  }

  onFormBuilt() {
    this.formIsBuilt = true;
  }

  async onSaveRecordItemClicked(saveType: SaveType) {
    try {
      const recordItem = this.fieldCollectionService.createRecordItemFromComponentValues();
      recordItem.RecordSlug = this.recordSlug;
      this.busyService.show();
      await this.apiService.postRecordItem(this.recordItemSlug, recordItem);

      this.busyService.hide();

      if (saveType !== SaveType.SaveAndCopy) {
        this.messageService.showSuccess('Saved');
      }

      if (this.isQuickAddForm) {
        this.dialogRef.close(true);
        return;
      }

      this.tabs.forEach(tab => tab.data = undefined);

      this.canCancel = true;
      this.isNewItem = false;
      
      if(this.isCalendarRecordSet){
            this.apiService.cacheCalendar({
                recordSlug: this.recordSlug
            });
      }
      
      switch (saveType) {
        case SaveType.SaveAndExit:
          await this.routingService.toRecordItemsList(this.recordSlug, this.getListpage());
          break;
        case SaveType.SaveAndStay:
          await this.loadItem();
          break;
        case SaveType.SaveAndCopy:
          await this.copyRecordItem();
          this.messageService.showSuccess('Copied');
          break;
        case SaveType.SaveAndNew:
          await this.createNewRecordItem();
          break;
      }
    } catch (e) {
      this.busyService.hide();
      if (e.message) {
        this.messageService.showError(e.message);
      }
    }
  }

  private async createNewRecordItem() {
    if (!this.permissions.canCreate) {
      return;
    }

    const itemSlug = await this.apiService.createRecordItem(this.recordSlug);
    this.fieldCollectionService.mainRecordItemSlug = itemSlug;
    await this.routingService.toRecordItemEdit(itemSlug);
  }

  private async copyRecordItem() {
    if (!this.permissions.canCreate) {
      return;
    }
    const data = await this.apiService.copyRecordItem(this.recordSlug, this.recordItemSlug);
    const newItemSlug = data.Slug;
    this.fieldCollectionService.mainRecordItemSlug = newItemSlug;
    await this.routingService.toRecordItemEdit(newItemSlug);
  }

  async onDeleteRecordItemClicked() {
    if (!this.permissions.canDelete) {
      return;
    }

    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-item').toPromise(),
      accept: async _ => {
        this.busyService.show();
        await this.apiService.deleteRecordItem(this.recordItemSlug);
        await this.routingService.toRecordItemsList(this.recordSlug, this.getListpage());
        if(this.isCalendarRecordSet){
            this.apiService.cacheCalendar({
                recordSlug: this.recordSlug
            });
        }
        this.busyService.hide();
        this.messageService.showSuccess(this.translateService.instant('item-deleted'));
      }
    });
  }

  private createDataForRecordItemTableView(fields: FormMetaField[], recordItemData: RecordItemData): any[] {
    const data = [];
    fields.forEach((field: FormMetaField) => {
      // field-mappings and has-many field values should not be shown in view mode
      const showInViewMode = !(field.isRelationFieldMappingField() || field.isRelationHasManyField());
      const itemData: ItemData = recordItemData.ItemData.find(id => id.FormFieldSlug === field.slug);
      const value = (itemData) ? itemData.Value : field.value;
      const valueFormatted = field.formatValueForViewing(value);
      const fieldSettingType = this.getFieldSettingType(field.Setting);
      data.push({
        label: field.label,
        value: valueFormatted,
        type: field.Type,
        settingType: fieldSettingType,
        rawValue: field.value,
        slug: field.Slug,
        showInViewMode
      });
    });
    return data;
  }
  
  private getFieldSettingType(Setting){
    for(var i = 0; i < Setting.length; i++){
        if(Setting[i].title == 'type') return Setting[i].value;
    }
 }
  private createDataForModelItemTableView(fields: FormMetaField[], columnNamesToShow: string[]): any[] {
    const data = [];

    fields.forEach((field: FormMetaField) => {
      const value = field.formatValueForViewing(field.value);

      data.push({
        label: field.label,
        value,
        type: field.Type,
        rawValue: field.value,
        slug: field.name,
        showInViewMode: columnNamesToShow.indexOf(field.name) >= 0
      });
    });
    return data;
  }

  onCancelClicked() {
    if (this.isQuickAddForm) {
      this.dialogRef.close(false);
    } else {
      this.goBackFromEdit();
    }
  }

  onEditBtnClicked() {
    this.clickedEditBtnInViewMode = true;
    this.editMode = true;
  }

  async onRecordLinkClicked() {
    await this.routingService.toRecordItemsList(this.recordSlug, this.getListpage());
  }


  /**
   * Methods for tabs
   */

  private createDataForTabs() {
    const relationFields = this.recordFormData.getFormMetaFields().filter(
      field =>
        (field.type === FieldType.RelationField)
        && (field.getSettingValue(FieldSettings.ShowInItemView)));
    this.tabs = [];
    relationFields.forEach(f => {
      const hasMany = f.getSettingValue(FieldSettings.RelationType) === FieldSettingValues.HasMany;
      this.tabs.push({ label: f.label, field: f, hasMany, data: undefined, itemType: undefined });
    });
  }

  async onTabChanged(tabIndex) {
    if ((tabIndex <= 0) || (tabIndex > this.tabs.length)) {
      return;
    }

    const tab = this.tabs[tabIndex - 1];
    if (!tab.data) {
      this.busyService.show();

      const field = tab.field as FormMetaField;
      const relationType = field.getSettingValue(FieldSettings.RelationType);
      const relationData = field.getSettingValue(FieldSettings.RelationData);

      if ((relationType === FieldSettingValues.HasOne) || (relationType === FieldSettingValues.FieldMapping)) {
        const itemSlug = tab.field.Value;
        if (itemSlug) {
          if (relationData === FieldSettingValues.Record) {
            const recordItemData = await this.apiService.getRecordItem(itemSlug);
            const recordSlug = recordItemData.Record.Slug;
            const recordFormData = await this.apiService.getRecordFormData(recordSlug, itemSlug);
            tab.data = this.createDataForRecordItemTableView(recordFormData.getFormMetaFields(), recordItemData);
          }
          if (relationData === FieldSettingValues.Model) {
            const modelName = field.getSettingValue(FieldSettings.ModelSelect);
            const columns = await this.apiService.getModelSummaryFields(modelName);
            const modelFormData = await this.apiService.getFormFieldsForModelObject(modelName, itemSlug);
            tab.data = this.createDataForModelItemTableView(modelFormData.getFormMetaFields(), Object.keys(columns));
          }
        }
      }

      if (relationType === FieldSettingValues.HasMany) {
        const itemSlugs = field.value;
        if (Array.isArray(itemSlugs) && (itemSlugs as []).length > 0) {

          if (relationData === FieldSettingValues.Record) {
            tab.recordSlug = field.getSettingValue(FieldSettings.RecordSelect);
            tab.data = await new TableData(this.apiService).loadRecordItems(tab.recordSlug, itemSlugs);
            tab.itemType = ItemType.Record;
          }

          if (relationData === FieldSettingValues.Model) {
            tab.modelName = field.getSettingValue(FieldSettings.ModelSelect);
            tab.data = await new TableData(this.apiService).loadModelItems(tab.modelName, itemSlugs);
            tab.itemType = ItemType.Model;
          }
        }
      }

      this.busyService.hide();
    }
  }


  async onDeleteRelationItems(tabIndex, itemSlugsToDelete: string[]) {
    const tab = this.tabs[tabIndex];

    let itemSlugs: any[] = (tab.field as FormMetaField).value;
    itemSlugsToDelete.forEach(is => {
      itemSlugs = itemSlugs.filter(slug => slug !== is);
    });

    await this.apiService.putRecordItemFieldValue(this.recordItemSlug, (tab.field as FormMetaField).Slug, itemSlugs);
    tab.data = undefined;
    await this.loadRecordItem(this.recordItemSlug);
    await this.onTabChanged(tabIndex);
  }

  onRelationRowEditClicked(tab, itemSlug) {
    if (tab.itemType === ItemType.Record) {
      this.routingService.toRecordItemEdit(itemSlug);
    }

    if (tab.itemType === ItemType.Model) {
      this.routingService.toAdminModelItemEdit(tab.modelName, itemSlug);
    }
  }

  /**
   * Navigation methods
   */

  hasNextItem() {
    return (this.navInfo['nextItem'] !== undefined && this.navInfo['nextItem'] != null);
  }

  hasPrevItem() {
    return (this.navInfo['prevItem'] !== undefined && this.navInfo['prevItem'] != null);
  }

  async onNextClicked() {
    await this.navigateToItem('next');
  }

  async onPrevClicked() {
    await this.navigateToItem('prev');
  }

  private async navigateToItem(direction: string) {
    const newItemSlug = (direction === 'next') ? this.navInfo['nextItem'] : this.navInfo['prevItem'];
    if (newItemSlug !== null) {
      if (this.editMode) {
        await this.routingService.toRecordItemEdit(newItemSlug);
      } else {
        await this.routingService.toRecordItemView(newItemSlug);
      }
    }
  }

  private async goBackFromEdit() {
    if (this.clickedEditBtnInViewMode) {
      this.editMode = false;
      await this.loadRecordItem(this.recordItemSlug);
    } else {
      await this.routingService.toRecordItemsList(this.recordSlug, this.getListpage());
    }
  }

  private getListpage() {
    const listpage: number = +this.route.snapshot.queryParamMap.get('listpage');
    let page = 1;
    if (!isNaN(listpage) && (listpage > 0)) {
      page = listpage;
    }
    return page;
  }

  deleteTaskOpenModal() {
    this.openDeleteCheckModal = true;
  }

  async deleteTask() {
    this.busyService.show();
    const res: any = await this.apiService.deleteTask(this.task);
    if (res && res === 'Success') {
      this.messageService.showSuccess('Delete Success');
      this.location.back();
      this.busyService.hide();
    } else {
      this.messageService.showError(res);
      this.busyService.hide();
    }
    this.deleteModalHide();
  }

  deleteModalHide() {
    this.openDeleteCheckModal = false;
  }

  editTaskModalOpen() {
    this.openEditModal = true;
  }

  async editTask(event, showMessage = true) {
    this.busyService.show();
    const res = await this.apiService.updateTask(this.task, event);
    if (res) {
      if (showMessage) {
        this.messageService.showSuccess('Update Success');
      }
      this.busyService.hide();
    } else {
      if (showMessage) {
        this.messageService.showError(res);
      }
      this.busyService.hide();
    }
  }

  editModalHide() {
    this.openEditModal = false;
  }

  async printPDF(templateSlug) {
    this.busyService.show();
    let printPDFResp: any;
    printPDFResp = await this.apiService.printRecordItem(this.recordItemSlug, templateSlug);
    if (printPDFResp) {
      // this.openFileViewer(printPDFResp);
      // this.downloadFile(printPDFResp.fileURL, 'pdf', printPDFResp.fileName);
      saveAs(printPDFResp, this.recordItemSlug + '.pdf');
    }
    this.busyService.hide();
  }

  downloadFile(data, type, filename) {
    const blob = new Blob([data], { type: `text/pdf` });
    const url = window.URL.createObjectURL(blob);

    this.http.get(url, { responseType: 'blob', headers: { Accept: 'application/pdf' } })
      .subscribe(b => {
        saveAs(b, filename);
      });

  }

  async openFileViewer(fileInfo: FileInfo) {
    await this.viewFileDialog.show(fileInfo);
  }

  async setTaskAsSeen(tasks, taskSlug, apiService) {
    tasks.forEach(item => {
      if (item.Slug === taskSlug && item.Status === 'Unseen') {
        const obj = {
          Fields: {
            Status: 'Seen'
          }
        };
        return apiService.updateTask(taskSlug, obj);
      }
    });
  }

}
