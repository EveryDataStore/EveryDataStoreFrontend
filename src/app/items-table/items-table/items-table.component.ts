import { ApiService } from 'src/app/shared/services/api.service';
import { BusyService } from '../../shared/services/busy.service';
import { SettingsService } from '../../shared/services/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, LazyLoadEvent, SortEvent } from 'primeng/api';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Permissions } from '../../shared/services/permissions.service';
import { DataRow, ItemsType, TableData } from 'src/app/shared/models/ressources/table-data';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { ItemComponent } from '../../record/item/item/item.component';

/**
 * Generic items table component
 *
 * This component can be used for both record items and model items. It uses a TableData object as data source.
 *
 * There are 2 ways of usage:
 * - no lazy loading: a TableData object can be created outside and filled with data, giving it as attribute
 * - lazy loading: dont set table data as attribute, but call the setupFromParameter method on the items table object directly
 */

@Component({
/*  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimeNGModule,
    TranslateModule
  ],*/
  selector: 'app-items-table',
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.scss']
})
export class ItemsTableComponent implements OnInit {

  @Input()
  tableData: TableData;

  @Input()
  hasHeader = false;

  @Input()
  headerTitle = '';

  @Input()
  hasDeleteButtons = true;

  @Input()
  hasEditButtons = true;

  @Input()
  hasQuickAddButton = false;

  @Input()
  multiple = true;

  @Input()
  confirmDeleteItemMessage = '';

  @Input()
  confirmMultiDeleteItemsMessage = '';

  @Input()
  loadLazy = false;

  @Output()
  deleteItems = new EventEmitter<string[]>();

  @Output()
  rowEditClicked = new EventEmitter<string>();

  itemsPerPage: number;
  actualPage: number;
  first: number;
  rowsSelected: DataRow[] = [];
  permissions: Permissions = new Permissions();
  selectionMode: string;

  itemIdsSelected: string[];

  private searchSub$ = new Subject<string>();
  searchTerm: string;
  isDateFilterVisible = false;
  createdFromFilter: string;
  createdUntilFilter: string;
  baseMultiDeleteBtnCaption = '';
  isQuickAddDialogVisible = false;

  constructor(private apiService: ApiService,
              private confirmationService: ConfirmationService,
              private translateService: TranslateService,
              private settingsService: SettingsService,
              private busyService: BusyService,
              private dialogService: DialogService) { }

  async ngOnInit() {
    this.baseMultiDeleteBtnCaption = await this.translateService.get('delete-marked-items').toPromise();
    this.selectionMode = (this.multiple) ? 'multiple' : 'single';
    this.itemsPerPage = this.settingsService.getItemsPerPage();

    if (this.confirmDeleteItemMessage === '') {
      this.confirmDeleteItemMessage = await this.translateService.get('confirm.really-delete-item').toPromise();
    }
    if (this.confirmMultiDeleteItemsMessage === '') {
      await this.translateService.get('confirm.really-delete-marked-items').toPromise();
    }
    this.setupSearchSub$();
  }

  /**
   * Setting up the table data object from parameter
   * Call this method when used with lazy loading
   *
   * @param itemsType either Record or Model
   * @param datasetId unique slug of the record or model
   * @param itemIdsSelected optional: list of selected item slugs
   */
  public async setupFromParameter(itemsType: ItemsType, datasetId: string, itemIdsSelected?: string | string[]) {
    this.resetSearch();
    this.tableData = new TableData(this.apiService);
    await this.tableData.initParameter(itemsType, datasetId, this.itemsPerPage);
    if (itemIdsSelected) {
      this.setItemIdsSelected(itemIdsSelected);
    }
    await this.loadItems(1);
  }

  public getItemIdsSelected() {
    if (Array.isArray(this.rowsSelected)) {
      return this.rowsSelected.map(row => row.itemSlug);
    } else {
      return (this.rowsSelected as unknown as DataRow).itemSlug;
    }
  }

  public setItemIdsSelected(itemIds: string | string[]) {
    this.itemIdsSelected = (Array.isArray(itemIds)) ? itemIds as string[] : [itemIds as string];

    if (!this.loadLazy) {
      this.markSelectedItems();
    }
  }

  private markSelectedItems() {
    this.rowsSelected = [];
    if (!this.itemIdsSelected) {
      return;
    }

    (this.itemIdsSelected as unknown as string[]).forEach(itemId => {
      const row = this.tableData.rows.find(r => r.itemSlug === itemId);
      if (row) {
        this.rowsSelected.push(row);
      }
    });
  }

  async onRowClicked(itemSlug: string) {
  }

  onEditItemClicked(itemSlug: string) {
    this.rowEditClicked.emit(itemSlug);
  }

  async onSearchChanged(searchTerm: string) {
    this.searchSub$.next(searchTerm);
  }

  async doSearch(searchTerm: string) {
    this.busyService.show();
    if (this.isDateFilterVisible) {
      if (this.createdFromFilter) {
        searchTerm += ',Created:GreaterThanOrEqual=' + this.createdFromFilter;
      }
      if (this.createdUntilFilter) {
        searchTerm +=  ',Created:LessThanOrEqual=' + this.createdUntilFilter;
      }
    }
    await this.tableData.setSearchTerm(searchTerm);
    this.busyService.hide();
  }

  onShowDateFilterClicked() {
    if (!this.isDateFilterVisible) {
      this.createdFromFilter = undefined;
      this.createdUntilFilter = undefined;
    }
    this.isDateFilterVisible = !this.isDateFilterVisible;
  }

  onDateSelected(date: Date, which: string) {
    const format = 'yyyy-MM-dd';
    const dateString = formatDate(date, format, this.settingsService.getLocale());
    if (which === 'from') {
      this.createdFromFilter = dateString;
    } else {
      this.createdUntilFilter = dateString;
    }
  }

  async onLazyLoad(event: LazyLoadEvent) {
    this.itemsPerPage = event.rows ?  event.rows : this.itemsPerPage;
    const page = Math.floor((event.first + 1) / this.itemsPerPage) + 1;
    await this.loadItems(page, event.sortField, event.sortOrder);
  }

  private async loadItems(page: number, sortColumn = '', sortOrder = 1) {
    this.busyService.show();
    this.actualPage = page;
    this.first = (this.actualPage - 1) * this.itemsPerPage;
    await this.tableData.loadItems(page);

    this.markSelectedItems();
    this.busyService.hide();
  }

  customSort(event: SortEvent) {
    event.data.sort((data1, data2) => {
      const value1 = data1.data[event.field];
      const value2 = data2.data[event.field];

      const result = value1.localeCompare(value2);
      return (event.order * result);
    });
  }

  async onDeleteItemClicked(itemSlug) {
    this.confirmationService.confirm({
      header:  await this.translateService.get('confirm.please-confirm').toPromise(),
      message: this.confirmDeleteItemMessage,
      accept: async _ => {
        this.deleteItems.emit([itemSlug]);
      }
    });
  }

  async onMarkedItemsDeleteClicked() {
    this.confirmationService.confirm({
      header:  await this.translateService.get('confirm.please-confirm').toPromise(),
      message: this.confirmMultiDeleteItemsMessage,
      accept: async _ => {
        const itemSlugs: string[] = [];
        this.rowsSelected.forEach(row => itemSlugs.push(row.itemSlug));

        this.deleteItems.emit(itemSlugs);
        this.rowsSelected = [];
      }
    });
  }

  async onQuickAddClicked() {
    this.busyService.show();
    const itemSlug = await this.apiService.createRecordItem(this.tableData.getDatasetId());
    this.busyService.hide();
    const ref = this.dialogService.open(ItemComponent, {
      data: {
        recordSlug: this.tableData.getDatasetId(),
        itemSlug
      }
    });
    ref.onClose.subscribe(async newItemCreated => {
      if (newItemCreated) {
        await this.loadItems(1);
      }
    });
  }

  getMultiDeleteBtnCaption() {
    let caption = this.baseMultiDeleteBtnCaption;
    if (this.rowsSelected.length > 0) {
      caption += ' (' + this.rowsSelected.length + ')';
    }
    return caption;
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

  private resetSearch() {
    this.isDateFilterVisible = false;
    this.createdFromFilter = undefined;
    this.createdUntilFilter = undefined;
    this.searchTerm = '';
  }
}
