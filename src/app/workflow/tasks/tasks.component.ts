import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { MessageUtilService } from '../../shared/services/message-util.service';
import { ActivatedRoute } from '@angular/router';
import { BusyService } from '../../shared/services/busy.service';
import { Permissions, PermissionsService } from '../../shared/services/permissions.service';
import { SettingsService } from '../../shared/services/settings.service';
import { RoutingService } from '../../shared/services/routing.service';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { LazyLoadEvent } from 'primeng/api';
import { RecordItemData } from '../../shared/models/entities/record-item-data';
import { FieldSettings } from 'src/app/shared/models/field-settings/field-setting';
import { formatDate } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit, OnChanges {
  @Input() taskStatus: any;
  public tasksSlug: any;
  public tasks: any;

  public cols = [];
  public fields = [];

  public recordItemsCount = 1;
  public itemsPerPage: number;
  public first = 0;
  public taskTitle = '';
  public permissions: Permissions = new Permissions();
  public rowsSelected = [];
  public actualPage = 1;
  private baseMultiDeleteBtnCaption = '';
  public loadedTable = false;
  private searchSub$ = new Subject<string>();
  searchTerm = '';
  showFilter = false;
  createdFrom: string;
  createdTo: string;

  constructor(private apiService: ApiService,
              private messageService: MessageUtilService,
              private busyService: BusyService,
              private route: ActivatedRoute,
              private permissionsService: PermissionsService,
              private settingsService: SettingsService,
              private routingService: RoutingService,
              private confirmationService: ConfirmationService,
              private translateService: TranslateService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  async ngOnInit() {
    this.setupSearchSub$();
    this.busyService.show();
    this.itemsPerPage = this.settingsService.getItemsPerPage();
    this.permissions = await this.permissionsService.getPermissionsForModel('RecordItem');
    this.baseMultiDeleteBtnCaption = await this.translateService.get('delete-marked-items').toPromise();

    this.route.params.subscribe(async (params) => {
      this.tasksSlug = params['Slug'];
      this.taskStatus = params['taskStatus'] ?  params['taskStatus'] : 'Seen,Unseen';

      if (this.tasksSlug) {
        const page: number = +this.route.snapshot.queryParamMap.get('page');
        if (!isNaN(page) && (page > 0)) {
          this.actualPage = page;
        }
        await this.initTaskInfo();
        await this.loadTasksItem(this.tasksSlug, this.taskStatus, this.actualPage);
        this.busyService.hide();
      }
      this.busyService.hide();
    });
  }

  async loadItemsLazy(event: LazyLoadEvent) {
    const page = Math.floor((event.first + 1) / this.itemsPerPage) + 1;
    if (this.tasksSlug) {
      await this.loadTasksItem(this.tasksSlug, this.taskStatus, page);
    }
  }

  async initTaskInfo() {
    this.recordItemsCount = await this.apiService.getTasksCount(this.tasksSlug, this.taskStatus);
  }

  async loadTasksItem(Slug, taskStatus, page) {
    this.busyService.show();
    this.tasks = [];
    this.cols = [];

    this.actualPage = page;
    this.first = (this.actualPage - 1) * this.itemsPerPage;

    const result = await this.apiService.findByIdEveryWorkflowDefinition(Slug, taskStatus, this.actualPage, this.itemsPerPage, this.searchTerm, this.createdFrom, this.createdTo);


    if (result === 'No items were found') {
      this.tasks = null;
      this.busyService.hide();
      return this.messageService.show(await this.translateService.get('no-items-were-found').toPromise());
    }
    const tasks = result;
    this.taskTitle = tasks[0].Definitionname;

    const recordFormData = await this.apiService.getRecordFormData(tasks[0].RecordSetItem.RecordSet.Slug);

    this.cols.push({ title: 'Action', fieldSlug: 'Actionname', fieldType: 'textfield' });
    for (const field of tasks) {
      for (const field2 of recordFormData.getFormMetaFields()) {
        if (field2.getSettingValueAsBoolean(FieldSettings.ShowInResultList) && field2.getSettingValueAsBoolean(FieldSettings.Active)) {
          const isExist = this.cols.filter(item => item.fieldSlug === field2.slug);
          if (isExist.length <= 0) {
            const col = {status: field.Status, title: field2.label, fieldSlug: field2.slug, fieldType: field2.type };
            this.cols.push(col);
            this.fields[field2.slug] = field2;
          }
        }
      }
    }

    this.cols.push({ title: 'Note', fieldSlug: 'Note', fieldType: 'textfield' });


    const newRows = [];
    if (tasks.length > 0) {

      for (const ri of tasks) {
        //const taskItem = await this.apiService.getTask(ri.Slug);
        const taskItem = ri;
        const row = {};
        const rid: RecordItemData = ri.RecordSetItem;
        if (!rid.ItemData || rid.ItemData.length <= 0) {
          continue;
        }
        row['recordItemSlug'] = rid.Slug;
        row['DefinitionSlug'] = ri.Definition.Slug;
        row['Slug'] = ri.Slug;
        if (ri && ri.Note) {
          row['Note'] = ri.Note;
        }

        if (ri && ri.Actionname) {
          row['Actionname'] = ri.Actionname;
        }

        row['status'] = ri.Status;

        rid.ItemData.forEach(itemData => {
          const field = this.fields[itemData.FormFieldSlug];
          let value = itemData.Value;

          if (field !== undefined) {
            value = field.formatValueForViewing(value);
          }
          row[itemData.FormFieldSlug] = value;
        });
        newRows.push(row);
      }
    }
    this.tasks = newRows;
    this.busyService.hide();
  }

  async onNewRecordItemClicked() {
    if (!this.permissions.canCreate) {
      return;
    }

    const itemSlug = await this.apiService.createRecordItem(this.tasksSlug);
    // await this.routingService.toRecordItemEdit(itemSlug);
  }

  async onEditItemClicked(rowElement: any) {
    const RecordItemSlug = rowElement.recordItemSlug;
    const DefinitionSlug = rowElement.DefinitionSlug;
    const Slug = rowElement.Slug;


    if (!this.permissions.canEdit) {
      return;
    }
    await this.routingService.toRecordItemEdit(RecordItemSlug, { task: Slug, diffinition: DefinitionSlug, type: 'workflow' });
  }

  async onDeleteItemClicked(rowElement: any) {
    if (!this.permissions.canDelete) {
      return;
    }

    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-item').toPromise(),
      accept: async _ => {
        await this.apiService.deleteTask(rowElement.Slug);
        await this.loadTasksItem(this.tasksSlug, this.taskStatus, this.actualPage);
      }
    });
  }

  async onRowClicked(rowElement: any) {
    const RecordItemSlug = rowElement.recordItemSlug;
    const DefinitionSlug = rowElement.DefinitionSlug;
    const Slug = rowElement.Slug;
    if (!this.permissions.canView) {
      return;
    }
    await this.routingService.toRecordItemView(RecordItemSlug, { task: Slug, diffinition: DefinitionSlug });
  }

   getMultiDeleteBtnCaption() {
    let caption = this.baseMultiDeleteBtnCaption;
    if (this.rowsSelected.length > 0) {
      caption += ' (' + this.rowsSelected.length + ')';
    }
    return caption;
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
        for (row of this.rowsSelected) {
          await this.apiService.deleteTask(row['Slug']);
        }
        await this.loadTasksItem(this.tasksSlug, this.taskStatus, this.actualPage);
        this.rowsSelected = [];
      }
    });
  }

  async onShowFilter() {
    this.showFilter = ! this.showFilter;
    if (!this.showFilter) {
      this.createdTo = '';
      this.createdFrom = '';
    }
  }

  async onCreatedFrom(event) {
    const format = 'yyyy-MM-dd';
    this.createdFrom = formatDate(event, format, 'en-US');
    this.showFilter = true;
  }

  async onCreatedTo(event) {
    const format = 'yyyy-MM-dd';
    this.createdTo = formatDate(event, format, 'en-US');
    this.showFilter = true;
  }

  async search(searchTerm) {
    this.searchTerm = searchTerm;
    this.searchSub$.next(this.searchTerm);
  }

  private async doSearch(searchTerm) {
    await this.loadTasksItem(this.tasksSlug, this.taskStatus, this.actualPage);
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
}
