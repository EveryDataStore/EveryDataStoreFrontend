import { Permissions } from './../../shared/services/permissions.service';
import { PermissionsService } from 'src/app/shared/services/permissions.service';
import { RoutingService } from './../../shared/services/routing.service';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/shared/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BusyService } from 'src/app/shared/services/busy.service';
import { CustomRecordFormData } from '../../shared/models/entities/custom-record-form-data';
import { LazyLoadEvent } from 'primeng/api';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { formatDate } from '@angular/common';
import { TableData } from 'src/app/shared/models/ressources/table-data';
import { RecordItemData } from 'src/app/shared/models/entities/record-item-data';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MessageUtilService } from '../../shared/services/message-util.service';
import * as saveAs from 'file-saver';
import { SummableItem } from 'src/app/shared/models/entities/record-items';
import { LanguageService } from 'src/app/shared/services/language.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ViewFileDialogComponent } from './../../plugins/file-manager/view-file-dialog/view-file-dialog.component';
import { FileInfo } from 'src/app/shared/models/entities/file-info';


@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit {

  @ViewChild('viewFileDialog')
  viewFileDialog: ViewFileDialogComponent;

  recordSlug: string;
  recordFormData: CustomRecordFormData;
  recordTitle = '';
  recordItemsCount: number;

  itemsPerPage: number;
  actualPage = 1;
  first = 0;
  permissions: Permissions = new Permissions();

  tableData: TableData;
  rowsSelected = [];
  searchTerm = '';
  showFilter = false;
  createdFrom: string;
  createdTo: string;
  downloadURL: string;
  isVisibleDownloadDialog = false;
  // Calendar Logic
  user: any;
  calendarView = false;
  calendarEvents: any = [];
  calendarconfig: CalendarOptions = {
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin]
  };
  // Calendar Logic

  dashboardPath: string;
  langDir: string;
  summableItems: any = [];
  footerTableData: Array<{label: string, value: string}> = [];

  isImage: boolean = false;
  isDoc: boolean = false;
  fileLink: string;
  imageURL: string;

  // search
  private searchSub$ = new Subject<string>();

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

  private baseMultiDeleteBtnCaption = '';

  constructor(private route: ActivatedRoute,
              private apiService: ApiService,
              private busyService: BusyService,
              private routingService: RoutingService,
              private confirmationService: ConfirmationService,
              private translateService: TranslateService,
              private languageService: LanguageService,
              private settingsService: SettingsService,
              private messageService: MessageUtilService,
              private permissionsService: PermissionsService,
              private http: HttpClient) {
    this.tableData = new TableData(this.apiService);
    this.dashboardPath = routingService.getDashboardPath();
  }


  async ngOnInit() {
    this.langDir = this.languageService.getLangDir();
    this.setupSearchSub$();
    this.itemsPerPage = this.settingsService.getItemsPerPage();
    this.baseMultiDeleteBtnCaption = await this.translateService.get('delete-marked-items').toPromise();
    this.permissions = await this.permissionsService.getPermissionsForModel('RecordItem');


    // ** 1 Calendar Logic
    this.user = await this.apiService.getUserInfo();
    // End 1 Calendar Logic
    this.route.params.subscribe(async params => {
      this.recordSlug = params['recordSlug'];
      if (this.recordSlug) {
        const page: number = +this.route.snapshot.queryParamMap.get('page');
        // Check if calenderview
        this.calendarView = this.recordSlug === this.user.Settings.CalendarRecordSlug ? true : false;

        if (this.calendarView) {
          await this.initCalendarInfo();
        }

        this.actualPage = 1;
        if (!isNaN(page) && (page > 0)) {
          this.actualPage = page;
        }

        // await this.initRecordInfo();
        await this.loadRecordItems(this.actualPage);
      }
    });
  }

  async onRowClicked(recordItemSlug) {
    if (!this.permissions.canView) {
      return;
    }

    await this.routingService.toRecordItemView(recordItemSlug, { listpage: this.actualPage });
  }

  async onEditItemClicked(recordItemSlug) {
    if (!this.permissions.canEdit) {
      return;
    }

    await this.routingService.toRecordItemEdit(recordItemSlug, { listpage: this.actualPage });
  }

  async onDeleteItemClicked(recordItemSlug) {
    if (!this.permissions.canDelete) {
      return;
    }

    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-item').toPromise(),
      accept: async _ => {
        await this.apiService.deleteRecordItem(recordItemSlug);
        await this.loadRecordItems(this.actualPage);
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
        let row: any;
        this.busyService.show();
        for (row of this.rowsSelected) {
          await this.apiService.deleteRecordItem(row['itemSlug']);
        }
        this.busyService.hide();
        await this.loadRecordItems(this.actualPage);
        this.rowsSelected = [];
      }
    });
  }

  async onNewRecordItemClicked() {
    if (!this.permissions.canCreate) {
      return;
    }

    const itemSlug = await this.apiService.createRecordItem(this.recordSlug);
    await this.routingService.toRecordItemEdit(itemSlug);
  }

  async search(searchTerm) {
    this.searchTerm = searchTerm;
    if (this.createdFrom) {
      this.searchTerm = this.searchTerm + ',Created:GreaterThanOrEqual=' + this.createdFrom;
    }
    if (this.createdTo) {
      this.searchTerm = this.searchTerm + ',Created:LessThanOrEqual=' + this.createdTo;
    }
    this.searchSub$.next(this.searchTerm);
  }

  private async doSearch(searchTerm) {
    await this.loadRecordItems(1);
  }

  async loadItemsLazy(event: LazyLoadEvent) {
    if (!this.recordSlug) {
      return;
    }
    this.itemsPerPage = event.rows ? event.rows : this.itemsPerPage;
    const page = Math.floor((event.first + 1) / this.itemsPerPage) + 1;
    await this.loadRecordItems(page, event.sortField, event.sortOrder);
  }

  private async loadRecordItems(page: number, sortColumn = '', sortOrder = 1) {
    this.busyService.show();
    this.actualPage = page;
    this.first = (this.actualPage - 1) * this.itemsPerPage;
    // 2 Calendar logic
    this.itemsPerPage = this.calendarView ? 10000 : this.itemsPerPage;
    // End 2 Calender logic

    const recordItems = await this.apiService.getRecordItems(this.recordSlug,
      page,
      this.itemsPerPage,
      sortColumn,
      sortOrder,
      this.searchTerm);

    this.recordItemsCount = recordItems.CountItems;
    this.recordFormData = new CustomRecordFormData();
    this.recordFormData.Record = recordItems.Record;
    this.recordTitle = recordItems.Record.Title;

    this.tableData.fillColsFromFormMetaFields(recordItems.Record.getFormMetaFields());

    if (this.calendarView) {
      this.getNiceCalendarRows(recordItems.Items);
    } else {
      this.tableData.fillRowsFromRecordItems(recordItems.Items);
    }
    this.calcSummableItems(recordItems.SummableItems);

    this.busyService.hide();
  }

  private calcSummableItems(summableItems: SummableItem[]) {
    if (!summableItems) {
      return;
    }

    this.footerTableData = [];
    this.tableData.cols.forEach(col => {
      const summableItem = summableItems.find(si => si.slug === col.fieldSlug);
      const value = (summableItem) ? summableItem.niceSum : '';
      this.footerTableData.push({
        label: col.fieldSlug,
        value
      });
    });
  }

  getMultiDeleteBtnCaption() {
    let caption = this.baseMultiDeleteBtnCaption;
    if (this.rowsSelected.length > 0) {
      caption += ' (' + this.rowsSelected.length + ')';
    }
    return caption;
  }

  async onShowFilter() {
    this.showFilter = ! this.showFilter;
    if (!this.showFilter) {
      this.createdFrom = '';
      this.createdTo = '';
    }
  }

  async onCreatedFrom(event) {
    const format = 'yyyy-MM-dd';
    this.createdFrom = formatDate(event, format, 'en-US') + ' 00:00:00';
  }

  async onCreatedTo(event) {
    const format = 'yyyy-MM-dd';
    this.createdTo = formatDate(event, format, 'en-US') + ' 23:59:59';
    this.showFilter = true;
  }

  // Calendar function
  private async initCalendarInfo() {
    const today = new Date();
    this.calendarconfig = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialDate: today,
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: this.calendarEvents,
      selectable: false,
      editable: false,
      droppable: false,
      dayMaxEventRows: true,
      eventClick: this.handleDateClick.bind(this)
    };
  }

  async handleDateClick(dateClickEvent) {
    await this.onEditItemClicked(dateClickEvent.event._def.extendedProps['recordItemSlug']);
  }


  // Calendar function
  private async getNiceCalendarRows(recordItems: RecordItemData[]) {
    const calendarNewRows = [];
    recordItems.forEach((rid: RecordItemData) => {
      const calendarRow = {};
      calendarRow['recordItemSlug'] = rid.Slug;
      rid.ItemData.forEach(itemData => {
        const field = this.recordFormData.getFormMetaFields().find(f => f.slug === itemData.FormFieldSlug);
        let calendarValue = itemData.Value;
        const isDate = ((new Date(calendarValue).toString() !== 'Invalid Date'));
        if (field !== undefined) {
          if (!isDate) {
            calendarValue = field.formatValueForViewing(calendarValue);
          }
        }
        calendarRow[itemData.FormFieldSlug] = calendarValue;
      });
      calendarNewRows.push(calendarRow);
    });

    const menu = [];
    calendarNewRows.forEach((element, index) => {
      const localData = this.user.Settings;
      const startdateField = element[localData.CalendarEventStartDateSlug];
      const enddateField = element[localData.CalendarEventEndDateSlug];
      const titleField = element[localData.CalendarEventTitleSlug];
      const colorField = element[localData.CalendarEventBackgroundSlug];
      menu.push({
        id: index + 1,
        title: titleField,
        start: startdateField,
        end: enddateField,
        color: colorField,
        recordItemSlug: element.recordItemSlug
      });
    });
    this.calendarEvents = menu;
  }

  async export(type) {
    this.busyService.show();

    const slugs = [];

    if (this.rowsSelected) {
      this.rowsSelected.forEach((item) => {
        slugs.push(item.itemSlug);
      });
    }

    const data: any = await this.apiService.exportRecordData(this.recordSlug, { type, recordItems: slugs });

    if (data && data.fileURL) {
      this.downloadFile(data.fileURL, type);
    }
    this.busyService.hide();
  }

  downloadFile(data, type) {
    const filename = 'download.' + type;
    this.http.get(data, {responseType: 'blob', headers: {Accept: 'application/' + type}})
    .subscribe(blob => {
      saveAs(blob, filename);
    });
  }

  import(e) {
    const apiToken = this.apiService.getToken();
    const url = environment.apiUrl + '/custom/CustomDataImporter/importRecordData/' + this.recordSlug + '?apitoken=' + apiToken;
    const file = e.files[0];
    const formData: FormData = new FormData();
    formData.append('file', file);

    this.busyService.show();
    this.http.post(url, formData).subscribe((res: any) => {
      this.messageService.showSuccess(res);
      this.busyService.hide();
      this.fileUpload.clear();
      this.loadRecordItems(this.actualPage);
    }, err => {
      this.messageService.showError(err);
      this.busyService.hide();
    });
  }

  private setupSearchSub$() {
    this.searchSub$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    // tslint:disable-next-line: deprecation
    ).subscribe(
        (searchTerm: string) => {
              this.doSearch(searchTerm);
      });
  }

  async openFileViewer(fileInfo: FileInfo){
    await this.viewFileDialog.show(fileInfo);
  }
}
