import { Hooks, PluginService, PluginServiceData } from '../../../../../shared/services/plugin.service';
import { ItemsTableComponent} from '../../../../../items-table/items-table/items-table.component';
import { ItemsType } from '../../../../../shared/models/ressources/table-data';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { BusyService } from '../../../../../shared/services/busy.service';
import { ApiService } from '../../../../../shared/services/api.service';
import { BaseFieldComponent } from '../../base-field/base-field.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FieldSettingsChangeService } from 'src/app/form-builder/services/field-settings-change.service';
import { FieldSettings } from 'src/app/shared/models/field-settings/field-setting';
import { FieldSettingValues } from 'src/app/shared/models/field-settings/field-setting-values';
import { RecordItemData } from 'src/app/shared/models/entities/record-item-data';
import { isObject } from 'src/app/shared/libs/typechecks';
import { RecordItems } from 'src/app/shared/models/entities/record-items';

@Component({
  selector: 'app-relation-field',
  templateUrl: './relation-field.component.html',
  styleUrls: ['./relation-field.component.scss']
})
export class RelationFieldComponent extends BaseFieldComponent implements OnInit {

  items: SelectItem[] = [];
  itemIdSelected: string;
  itemIdsSelected: string[] = [];
  isHasMany = false;

  recordSlug: string;
  modelName: string;
  itemsSelectedText: string;

  useDialog = true;
  showDialog = false;

  value: string|string[];
  loaded = false;

  relationData;
  relationType;
  relationSource;
  fieldMapping;
  displayFields: string[];

  recordItems: RecordItems;
  modelItems: [] = [];

  @ViewChild('itemsTable', {static: false})
  itemsTableComponent: ItemsTableComponent;

  constructor(private fieldSettingsChangeService: FieldSettingsChangeService,
              private apiService: ApiService,
              private confirmationService: ConfirmationService,
              private translateService: TranslateService,
              private busyService: BusyService,
              private pluginService: PluginService) {
    super();
    this.fieldSettingsChangeService.listen().subscribe(_ => {
      this.setSettingOptions();
    });
  }

  async ngOnInit() {
    this.doWaitForLoading();
    super.ngOnInit();
    await this.setSettingOptions();
    if (this.formMetaField.autoOpen) {
      this.onShowSelectDialogClicked();
    }
  }

  async onItemChanged() {
    // fire plugin hooks
    await this.pluginService.fire(Hooks.OnRelationFieldItemChanged, new PluginServiceData(this));

    if (this.relationType !== FieldSettingValues.FieldMapping) {
      return;
    }

    // if its an auto-open field, lets also not ask if the mapping should fill the field values
    if (this.formMetaField.autoOpen) {
      await this.fillFieldValuesFromMapping();
      return;
    }

    this.confirmationService.confirm({
      header:  await this.translateService.get('question').toPromise(),
      message: await this.translateService.get('confirm.use-values-from-selected-item').toPromise(),
      accept: async _ => {
        await this.fillFieldValuesFromMapping();
      }
    });
  }

  private async fillFieldValuesFromMapping() {
    let itemValues = {};
    if (this.relationData === FieldSettingValues.Record) {
      itemValues = await this.createFieldValuesFromSelectedRecordItem();
    }
    if (this.relationData === FieldSettingValues.Model) {
      itemValues = await this.createFieldValuesFromSelectedModelItem();
    }

    if (Object.keys(itemValues).length > 0) {
      Object.keys(this.fieldMapping).forEach(fieldId => {
        const component = this.fieldCollectionService.findInRecordItem(this.recordItemSlug, fieldId);
        if (component) {
          component.setValue(itemValues[this.fieldMapping[fieldId]]);
        }
      });
    }
    await this.pluginService.fire(Hooks.AfterFilledRelationFieldValuesFromMapping, new PluginServiceData(this, itemValues));
  }

  private async createFieldValuesFromSelectedRecordItem() {
    const recordItem = await this.apiService.getRecordItem(this.itemIdSelected);
    const values = {};
    recordItem.ItemData.forEach(i => values[i.FormFieldSlug] = i.Value);
    return values;
  }

  private async createFieldValuesFromSelectedModelItem() {
    const modelItem = await this.apiService.getModelItem(this.modelName, this.itemIdSelected);
    const values = {};
    Object.keys(modelItem).forEach(fieldName => values[fieldName] = modelItem[fieldName]);
    return values;
  }

  public getValue() {
    if (this.isHasMany) {
      return this.itemIdsSelected;
    } else {
      return this.itemIdSelected;
    }
  }

  public async setValue(value) {
    this.value = value;
    await new Promise(resolve => {
      while (!this.loaded){
          setTimeout(() => {
          }, 10);
      }
      this.setSelectedFromValue();
    });
  }

  public getSingleItemIdSelected(): string {
    if (Array.isArray(this.itemIdSelected)) {
      return this.itemIdSelected[0];
    } else {
      return this.itemIdSelected;
    }
  }

  private async setSettingOptions() {
    this.items = [];
    this.relationData = this.formMetaField.getSettingValue(FieldSettings.RelationData);
    this.relationType = this.formMetaField.getSettingValue(FieldSettings.RelationType);
    this.isHasMany = (this.relationType === FieldSettingValues.HasMany);

    if (this.relationType === FieldSettingValues.FieldMapping) {
      this.fieldMapping = this.formMetaField.getSettingValue(FieldSettings.FieldMapping);
    }
    this.displayFields = this.formMetaField.getSettingValue(FieldSettings.DisplayFields);
    this.modelName = this.formMetaField.getSettingValue(FieldSettings.ModelSelect);
    this.recordSlug = this.formMetaField.getSettingValue(FieldSettings.RecordSelect);
    if (!this.displayFields) { this.displayFields = []; }

    if (!this.useDialog) {
      if (this.relationData === FieldSettingValues.Model) {
        await this.createItemsFromModel(this.modelName);
      }
      if (this.relationData === FieldSettingValues.Record) {
        await this.createItemsFromRecord(this.recordSlug);
      }
    }

    this.loaded = true;
    this.fieldCollectionService.onLoadFinished(this);
  }

  private async setSelectedFromValue() {
    if (!this.value) { return; }

    if (this.isHasMany) {
      this.itemIdsSelected = (this.value as string[]);
    } else {
      this.itemIdSelected = this.value as string;
    }

    if (this.useDialog) {
      const itemIdsArray = (this.itemIdSelected) ? [this.itemIdSelected] : this.itemIdsSelected;
      this.itemsSelectedText = '';

      if (itemIdsArray.length > 0) {
        const labels: string[] = [];
        if (this.relationData === FieldSettingValues.Record) {
          const items = await this.apiService.getRecordItemsFromList(this.recordSlug, itemIdsArray);
          items.forEach(item => labels.push(this.createRecordItemDisplayName(item)));
        }

        if (this.relationData === FieldSettingValues.Model) {
          const items = await this.apiService.getModelItemsFromList(this.modelName, itemIdsArray);
          items.forEach(item => labels.push(this.createModelItemDisplayName(item)));
        }

        this.itemsSelectedText = labels.join(', ');
      }
    }
  }

  private async createItemsFromModel(modelName: string) {
    const itemsCount = await this.apiService.getModelItemsCount(modelName);
    this.modelItems = await this.apiService.getModelItems(modelName, 1, itemsCount);

    this.modelItems.forEach(modelItem => {
      this.items.push({label: this.createModelItemDisplayName(modelItem), value: modelItem['Slug']});
    });
  }

  private async createItemsFromRecord(recordSlug: string) {
    const itemsCount = await this.apiService.getRecordItemsCount(recordSlug);
    this.recordItems = await this.apiService.getRecordItems(recordSlug, 1, itemsCount);

    this.recordItems.Items.forEach((recordItem: RecordItemData) => {
      this.items.push({label: this.createRecordItemDisplayName(recordItem), value: recordItem.Slug});
    });
  }

  private createRecordItemDisplayName(recordItemData: RecordItemData): string {
    const labels: any[] = [];
    this.displayFields.forEach((df: string) => {
      const data = recordItemData.ItemData.find(id => id.FormFieldSlug === df);
      if (data) {
        labels.push(data.Value);
      }
    });
    return this.joinLabelsOrGetSlug(labels, recordItemData.Slug);
  }

  private createModelItemDisplayName(modelItem): string {
    const labels: any[] = [];
    this.displayFields.forEach(di => {
      const data = modelItem[di];
      if (data) {
        labels.push(data);
      }
    });
    return this.joinLabelsOrGetSlug(labels, modelItem['Slug']);
  }

  private joinLabelsOrGetSlug(labels: any[], slug: string) {
    labels.forEach((l, i) => {
      if (isObject(l)) {
        const merged = [];
        Object.keys(l).forEach(k => merged.push(l[k]));
        labels[i] = merged.join(' ');
      }
      if (Array.isArray(l)) {
        labels[i] = l.join(' ');
      }
    });

    let result = labels.join(' ');
    if (result.trim().length <= 0) {
      result = '[' + slug + ']';
    }
    return result;
  }

  /**
   * Items select dialog
   */

  async onShowSelectDialogClicked() {
    this.busyService.show();

    let itemsType: ItemsType;
    let datasetId: string;

    if (this.relationData === FieldSettingValues.Model) {
      itemsType = ItemsType.Model;
      datasetId = this.formMetaField.getSettingValue(FieldSettings.ModelSelect);
    }

    if (this.relationData === FieldSettingValues.Record) {
      itemsType = ItemsType.Record;
      datasetId = this.formMetaField.getSettingValue(FieldSettings.RecordSelect);
    }

    await this.itemsTableComponent.setupFromParameter(itemsType, datasetId, this.getValue());
    this.showDialog = true;

    this.busyService.hide();
  }

  onDialogHide() {
    this.showDialog = false;
  }

  async onItemsSelectedInDialog() {
    this.busyService.show();
    this.setValue(this.itemsTableComponent.getItemIdsSelected());
    this.showDialog = false;
    this.onItemChanged();
    this.busyService.hide();
  }
}
