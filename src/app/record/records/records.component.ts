import { Permissions } from '../../shared/services/permissions.service';
import { RoutingService } from 'src/app/shared/services/routing.service';
import { MenuService } from '../../shared/services/menu.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/shared/services/api.service';
import { BusyService } from 'src/app/shared/services/busy.service';
import { Record } from '../../shared/models/entities/record';
import { environment } from 'src/environments/environment';
import { ConfirmationService } from 'primeng/api';
import { MenuType } from 'src/app/shared/models/entities/menu';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { PermissionsService } from 'src/app/shared/services/permissions.service';
import { HttpClient } from '@angular/common/http';
import { MessageUtilService } from '../../shared/services/message-util.service';
import { saveAs } from 'file-saver';
import { LanguageService } from '../../shared/services/language.service';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss']
})
export class RecordsComponent implements OnInit {

  records: Record[] = [];
  recordsSelected: Record[] = [];
  itemsPerPage = 10;
  permissions: Permissions = new Permissions();
  isMultiItemDeletionActive = false;
  isItemExportImportActive = false;
  public recordSlug: any = '86582f71fe5172e1c0f3';
  dashboardPath: string;
  langDir: string;

  public exportItems = [
    {
      label: 'json', command: () => {
        this.export();
      }
    }
  ];
  @ViewChild('fileUpload') fileUpload: any;

  private baseMultiDeleteBtnCaption = '';

  constructor(private apiService: ApiService,
              private busyService: BusyService,
              private routingService: RoutingService,
              private translateService: TranslateService,
              private languageService: LanguageService,
              private confirmationService: ConfirmationService,
              private menuService: MenuService,
              private settingsService: SettingsService,
              private permissionsService: PermissionsService,
              private http: HttpClient,
              private messageService: MessageUtilService
  ) {
    this.dashboardPath = routingService.getDashboardPath();
  }

  async ngOnInit() {
    this.langDir = this.languageService.getLangDir();
    this.isMultiItemDeletionActive = this.settingsService.isActiveApp('everymultiitemdeletion');
    this.isItemExportImportActive = this.settingsService.isActiveApp('everyitemexportimport');
    this.itemsPerPage = this.settingsService.getItemsPerPage();
    this.busyService.show();
    this.permissions = await this.permissionsService.getPermissionsForModel('Record');
    this.baseMultiDeleteBtnCaption = await this.translateService.get('delete-marked-items').toPromise();
    await this.loadRecords();
    this.busyService.hide();

  }

  async loadRecords() {
    this.records = await this.apiService.getRecords();
  }

  search() {
  }

  async onEditRecordClicked(recordSlug) {
    if (!this.permissions.canEdit) {
      return;
    }

    await this.routingService.toRecordEdit(recordSlug);
  }

  async onDeleteRecordClicked(recordSlug) {
    if (!this.permissions.canDelete) {
      return;
    }

    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-item').toPromise(),
      accept: async _ => {
        this.busyService.show();
        await this.apiService.deleteRecord(recordSlug);
        await this.loadRecords();
        this.menuService.reloadMenu(MenuType.MainMenu);
        this.busyService.hide();
      }
    });
  }

  async onMarkedRecordsDeleteClicked() {
    if (!this.permissions.canDelete) {
      return;
    }

    if (!this.isMultiItemDeletionActive) {
      return this.printNotActiveAppMsg(' Every Multi Item Deletion ');
    }

    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-marked-items').toPromise(),
      accept: async _ => {
        this.busyService.show();
        let record: Record;
        for (record of this.recordsSelected) {
          await this.apiService.deleteRecord(record.Slug);
        }
        await this.loadRecords();
        this.menuService.reloadMenu(MenuType.MainMenu);
        this.busyService.hide();
      }
    });
  }

  getMultiDeleteBtnCaption() {
    let caption = this.baseMultiDeleteBtnCaption;
    if (this.recordsSelected.length > 0) {
      caption += ' (' + this.recordsSelected.length + ')';
    }
    return caption;
  }

  async export() {
    if (!this.isItemExportImportActive) {
      return this.printNotActiveAppMsg('Please Install Import & Export App');
    }
    this.busyService.show();
    const slugs = [];
    if (this.recordsSelected) {
      this.recordsSelected.forEach((item: Record) => {
        slugs.push(item.Slug);
      });
    }
    const apiToken = this.apiService.getToken();
    const records = [];

    for await (const slug of slugs) {
      const url = environment.apiUrl + 'custom/CustomRecordSet/getRecordFormData/' + slug + '?apitoken=' + apiToken;
      const getRes = await this.http.get(url).toPromise();
      records.push(getRes);
    }

    const stringRecords = JSON.stringify(records);
    this.downloadFile(stringRecords, 'json');
    this.busyService.hide();
  }

  downloadFile(data, type) {
    const blob = new Blob([data], { type: `text/${type}` });
    saveAs(blob, 'records.json');
  }

  import(e) {
    if (!this.isItemExportImportActive) {
      return this.printNotActiveAppMsg('Please Install Import & Export App');
    }
    const file = e.files[0];
    const myReader: FileReader = new FileReader();

    myReader.onloadend = () => {
      if (typeof myReader.result === 'string') {
        const data = JSON.parse(myReader.result);
        const length = data.length - 1;
        this.busyService.show();
        data.forEach((res: any, index) => {
          const apiToken = this.apiService.getToken();
          const url = environment.apiUrl + 'custom/CustomRecordSet/importRecordFormData/?apitoken=' + apiToken;

          this.http.put(url, res).subscribe(() => {
            if (index === length) {
              this.messageService.showSuccess('Done..');
              this.busyService.hide();
              this.fileUpload.clear();
              this.loadRecords();
            }
          }, err => {
            if (index === data.length) {
              this.messageService.showError(err);
              this.busyService.hide();
            }
          });
        });
      }
    };

    myReader.readAsText(file);

  }

  async onShowRecordItems(recordSlug) {
    if (!this.permissions.canView) {
      return;
    }

    await this.routingService.toRecordItemsList(recordSlug);
  }

  async onNewRecordItemClicked(recordSlug) {
    if (!this.permissions.canCreate) {
      return;
    }

    const itemSlug = await this.apiService.createRecordItem(recordSlug);
    await this.routingService.toRecordItemEdit(itemSlug);
  }

  async printNotActiveAppMsg(AppName) {
    const outmsg: string = AppName + ' ' +
      await this.translateService.get('app_not_active_or_license_is_not_available').toPromise() +
      await this.translateService.get('app_not_active_go_to_admin_panel').toPromise();
    this.messageService.showError(outmsg);
    return;
  }

}
