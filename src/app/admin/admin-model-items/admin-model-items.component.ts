import { PermissionsService, Permissions } from '../../shared/services/permissions.service';
import { SettingsService } from '../../shared/services/settings.service';
import { RoutingService } from 'src/app/shared/services/routing.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/shared/services/language.service';
import { BusyService } from 'src/app/shared/services/busy.service';
import * as saveAs from 'file-saver';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/shared/services/api.service';
import { environment } from 'src/environments/environment';
import { LazyLoadEvent } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MessageUtilService } from '../../shared/services/message-util.service';
import { isObject } from 'src/app/shared/libs/typechecks';

@Component({
  selector: 'app-admin-model-items',
  templateUrl: './admin-model-items.component.html',
  styleUrls: ['./admin-model-items.component.scss']
})
export class AdminModelItemsComponent implements OnInit {

  modelName = '';
  items: [] = [];
  cols: any[] = [];
  itemsCount = 0;
  itemsPerPage: number;
  itemsSelected: [] = [];
  actualPage: number;
  searchTerm = '';
  permissions: Permissions = new Permissions();
  reorderable = false;
  showFilter = false;
  createdFrom: string;
  createdTo: string;
  langDir: string;
  appItem: any;
  dashboardPath: string;

  private baseMultiDeleteBtnCaption = '';

  public exportItems = [
    {
      label: 'csv', command: () => {
        this.export('csv');
      }
    },
    {
      label: 'json', command: () => {
        this.export('json');
      }
    }
  ];

  @ViewChild('fileUpload') fileUpload: any;

  constructor(private route: ActivatedRoute,
              private routingService: RoutingService,
              private apiService: ApiService,
              private busyService: BusyService,
              private confirmationService: ConfirmationService,
              private translateService: TranslateService,
              private languageService: LanguageService,
              private settingsService: SettingsService,
              private permissionsService: PermissionsService,
              private messageService: MessageUtilService,
              private http: HttpClient) {
    this.dashboardPath = routingService.getDashboardPath();

  }

  async ngOnInit() {
    this.itemsPerPage = this.settingsService.getItemsPerPage();
    this.baseMultiDeleteBtnCaption = await this.translateService.get('delete-marked-items').toPromise();
    this.route.params.subscribe(async params => {
      this.modelName = params['modelName'];

      this.busyService.show();
      this.permissions = await this.permissionsService.getPermissionsForModel(this.modelName);
      await this.loadModelColumns();
      await this.loadModelItems(1);
      this.busyService.hide();
    });
    this.langDir = this.languageService.getLangDir();
  }

  async onEditItemClicked(slug: string) {
    if (!this.permissions.canEdit) {
      return;
    }

    await this.routingService.toAdminModelItemEdit(this.modelName, slug);
  }

  async onDeleteItemClicked(slug: string) {
    if (!this.permissions.canDelete) {
      return;
    }

    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-item').toPromise(),
      accept: async _ => {
        this.busyService.show();
        await this.apiService.deleteModelItem(this.modelName, slug);
        await this.loadModelItems(this.actualPage);
        this.busyService.hide();
      }
    });
  }

  async onMarkedItemsDeleteClicked() {
    if (!this.permissions.canDelete) {
      return;
    }

    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-marked-items').toPromise(),
      accept: async _ => {
        this.busyService.show();
        let item: any;
        for (item of this.itemsSelected) {
          await this.apiService.deleteModelItem(this.modelName, item.Slug);
        }
        await this.loadModelItems(this.actualPage);
        this.itemsSelected = [];
        this.busyService.hide();
      }
    });
  }

  async onNewItemClicked() {
    if (!this.permissions.canCreate) {
      return;
    }

    await this.routingService.toAdminModelNewItem(this.modelName);
  }

  private async loadModelColumns() {
    const columns = await this.apiService.getModelSummaryFields(this.modelName);
    const formFields = await this.apiService.getFormFieldsForModel(this.modelName);
    this.cols = [];

    // feature/reorder
    this.reorderable = formFields.Reorderable > 0;
    Object.keys(columns).forEach(columnName => {
      const field = formFields.getFormMetaFields().find(f => f.Name === columnName);
      this.cols.push({ name: columnName, title: columns[columnName], field });
    });
  }

  async search(searchTerm) {
    this.searchTerm = searchTerm;
    if (this.createdFrom) {
      this.searchTerm = this.searchTerm + ',Created:GreaterThanOrEqual=' + this.createdFrom;
    }

    if (this.createdTo) {
      this.searchTerm = this.searchTerm + ',Created:LessThanOrEqual=' + this.createdTo;
    }
    await this.loadModelItems(1);
  }

  async loadItemsLazy(event: LazyLoadEvent) {
    this.itemsPerPage = event.rows ? event.rows : this.itemsPerPage;
    const page = Math.floor((event.first + 1) / this.itemsPerPage) + 1;
    await this.loadModelItems(page, event.sortField, event.sortOrder);
  }

  private async loadModelItems(page: number, sortColumn = '', sortOrder = 1) {
    this.busyService.show();
    this.actualPage = page;

    try {
      this.items = await this.apiService.getModelItems(this.modelName, page, this.itemsPerPage, sortColumn, sortOrder, this.searchTerm);
      this.itemsCount = await this.apiService.getModelItemsCount(this.modelName, this.searchTerm);

    } catch (e) {
      console.error('Plugin ' + this.modelName + ' nicht gefunden!');
    }
    this.busyService.hide();
  }

  getItemValueFromColumn(item, col) {
    const value = item[col.name];

    if (isObject(value) && value !== null) {
      if (value.type !== undefined && value.type === 'img' && item.Icon.src !== '') {
        return '<img src="' + item.Icon.src + '" alt = "icon">';
      }
    }

    if (col.field !== undefined) {
      return col.field.formatValueForViewing(value);
    } else {
      return value;
    }
  }

  getMultiDeleteBtnCaption() {
    let caption = this.baseMultiDeleteBtnCaption;
    if (this.itemsSelected.length > 0) {
      caption += ' (' + this.itemsSelected.length + ')';
    }
    return caption;
  }

  async onSortColumn(slug: string, i: number) {
    const recordItem = {};
    recordItem['Fields'] = { Sort: i };
    await this.apiService.putModelObject(this.modelName, slug, recordItem);
  }

  // feature/reorder
  async sortColumn() {
    let i: number;
    i = 1;

    if (this.items) {
      this.busyService.show();
      this.items.forEach((item: any) => {
        if (item.Slug) {
          this.onSortColumn(item.Slug, i);
          i++;
        }
      });
      this.busyService.hide();
    }
  }

  async onShowFilter() {
    this.showFilter = !this.showFilter;
    if (!this.showFilter) {
      this.createdTo = '';
      this.createdFrom = '';
    }
  }

  async onCreatedFrom(event) {
    const format = 'yyyy-MM-dd';
    this.createdFrom = formatDate(event, format, 'en-US');
  }

  async onCreatedTo(event) {
    const format = 'yyyy-MM-dd';
    this.createdTo = formatDate(event, format, 'en-US');
  }

  async export(type) {
    this.busyService.show();

    const slugs = [];
    if (this.itemsSelected) {
      this.itemsSelected.forEach((item: any) => {
        slugs.push(item.Slug);
      });
    }
    const data: any = await this.apiService.exportModelData(this.modelName, { type, recordItems: slugs });

    if (data && data.fileURL) {
      this.downloadFile(data.fileURL, type);
    }

    this.busyService.hide();
  }

  downloadFile(data, type) {
    const filename = 'download.' + type;
    this.http.get(data, { responseType: 'blob', headers: { Accept: 'application/' + type } })
      .subscribe(blob => {
        saveAs(blob, filename);
      });
  }

  import(e) {
    const apiToken = this.apiService.getToken();
    const url = environment.apiUrl + '/custom/CustomDataImporter/importModelData/' + this.modelName + '?apitoken=' + apiToken;
    const file = e.files[0];
    const formData: FormData = new FormData();
    formData.append('file', file);
    this.busyService.show();
    this.http.post(url, formData).subscribe((res: any) => {
      if (typeof res === 'string') {
        this.messageService.showSuccess(res);
        this.busyService.hide();
        this.fileUpload.clear();
        this.loadModelItems(1);
      } else {
        this.messageService.showError(JSON.stringify(res));
        this.busyService.hide();
      }
    }, err => {
      this.messageService.showError(err);
      this.busyService.hide();
    });
  }

  /* App */
  async onInstallApp(app: any) {
    if (!this.permissions.canInstall) {
      console.error('no permissions to install');
      return;
    }

    if (app.Price === 0 || app.Price == null || app.Price === '') {
      this.confirmationService.confirm({
        header: await this.translateService.get('confirm.please-confirm').toPromise(),
        message: await this.translateService.get('confirm.really-install-app').toPromise(),
        accept: async _ => {
          await this.apiService.installFreeApp(app.Slug);
          this.messageService.showSuccess(await this.translateService.get('app-installed').toPromise());
          await this.loadModelItems(this.actualPage);
        }
      });
    }
  }

  async onDeinstallApp(app: any) {
    if (!this.permissions.canDeinstall) {
      return;
    }

    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-deinstall-app').toPromise(),
      accept: async _ => {
        await this.apiService.deinstallApp(app.Slug);
        this.messageService.showSuccess(await this.translateService.get('app-deinstalled').toPromise());
        await this.loadModelItems(this.actualPage);
      }
    });
  }

  async onAppRowClicked(app: any) {
    if (this.modelName === 'App') {
      this.appItem = app;
    } else {
      if (!this.permissions.canEdit) {
        return;
      }
      await this.routingService.toAdminModelItemEdit(this.modelName, app.Slug);
    }
  }
}
