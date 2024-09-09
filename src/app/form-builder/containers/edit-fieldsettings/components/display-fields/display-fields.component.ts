import { BusyService } from './../../../../../shared/services/busy.service';
import { SelectItem } from 'primeng/api';
import { SettingValuesChangeService } from './../../services/setting-values-change.service';
import { ApiService } from 'src/app/shared/services/api.service';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FieldSetting } from 'src/app/shared/models/field-settings/field-setting';
import { FieldSettingNames } from 'src/app/shared/models/field-settings/field-setting-names';
import { FieldSettingValues } from 'src/app/shared/models/field-settings/field-setting-values';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-display-fields',
  templateUrl: './display-fields.component.html',
  styleUrls: ['./display-fields.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DisplayFieldsComponent),
      multi: true
    }
  ]
})
export class DisplayFieldsComponent implements OnInit, ControlValueAccessor {

  @Input()
  editFields: FieldSetting[] = [];

  fieldItems: SelectItem[] = [];
  allFieldItems: SelectItem[] = [];
  fieldIdSelected: string;

  relationDataSetting: FieldSetting;
  modelSetting: FieldSetting;
  recordSetting: FieldSetting;
  recordSlug: string;
  modelName: string;
  objectKey: string;

  fieldItemsLoaded: Map<string, SelectItem[]> = new Map();
  fieldItemsSelected: Map<string, SelectItem[]> = new Map();
  fieldIdsFromSetting: string[] = [];

  propagateChange = (_: any) => { };

  constructor(private apiService: ApiService,
              private busyService: BusyService,
              private settingValuesChangeService: SettingValuesChangeService) { }

  async ngOnInit() {
    this.busyService.show();

    this.relationDataSetting = this.editFields.find(fs => fs.name === FieldSettingNames.RelationData);
    this.modelSetting = this.editFields.find(fs => fs.name === FieldSettingNames.Model);
    this.recordSetting = this.editFields.find(fs => fs.name === FieldSettingNames.Record);

    this.settingValuesChangeService.listen().subscribe( fs => {
      this.loadData();
    });

    await this.loadData();

    this.busyService.hide();
  }

  async loadData() {
    this.objectKey = null;
    if (this.relationDataSetting.value === FieldSettingValues.Record) {
      if (this.recordSetting.value) {
        this.objectKey = this.recordSetting.value as string;
        if (this.fieldItemsLoaded.get(this.objectKey) === undefined) {
          await this.loadRecordFieldNames(this.objectKey);
        }
      }
    }

    if (this.relationDataSetting.value === FieldSettingValues.Model) {
      if (this.modelSetting.value) {
        this.objectKey = this.modelSetting.value as string;
        if (this.fieldItemsLoaded.get(this.objectKey) === undefined) {
          await this.loadModelFieldNames(this.objectKey);
        }
      }
    }

    if (this.objectKey) {
      this.fieldItems = this.fieldItemsLoaded.get(this.objectKey);

      if (this.fieldIdsFromSetting && this.fieldIdsFromSetting.length > 0) {
        const fieldsSelected =  this.convertFromSetting(this.fieldIdsFromSetting);
        this.fieldItemsSelected.set(this.objectKey, fieldsSelected);
        this.fieldIdsFromSetting = [];
      }

      // remove selected items from field items
      if (this.fieldItemsSelected.get(this.objectKey)) {
        this.fieldItemsSelected.get(this.objectKey).forEach( fs => {
            this.fieldItems = this.fieldItems.filter(f => f.value !== fs.value);
        });
      }

      this.fieldIdSelected = null;
    } else {
      this.fieldItems = [];
    }
  }

  async loadRecordFieldNames(recordSlug: string) {

    const labels = await this.apiService.getRecordFieldActiveLabels(recordSlug);
    const fieldNames: SelectItem[] = [];
    labels.forEach( l => fieldNames.push({label: l['Label'], value: l['Slug'] }));
    this.fieldItemsLoaded.set(recordSlug, fieldNames);
  }

  async loadModelFieldNames(modelName: string) {
    const fields = await this.apiService.getModelSummaryFields(modelName);
    const fieldNames: SelectItem[] = [];
    Object.keys(fields).forEach(l => fieldNames.push({label: l, value: l}));
    this.fieldItemsLoaded.set(modelName, fieldNames);
  }

  onAddBtnClicked() {
    if (this.fieldIdSelected) {
      let fieldNamesSelected = this.fieldItemsSelected.get(this.objectKey);
      if (fieldNamesSelected === undefined) {
        fieldNamesSelected = [];
      }
      if (fieldNamesSelected.findIndex(fn => fn.value === this.fieldIdSelected) < 0) {
        fieldNamesSelected.push(this.fieldItems.find(fn => fn.value === this.fieldIdSelected));
        this.fieldItems = this.fieldItems.filter(fn => fn.value !== this.fieldIdSelected);
      }
      this.fieldItemsSelected.set(this.objectKey, fieldNamesSelected);

      this.propagateChange(this.convertToSetting(fieldNamesSelected));
    }
  }

  onRemoveBtnClicked(fieldItem: SelectItem) {
    const fieldItemsSelected = this.fieldItemsSelected.get(this.objectKey).filter(fn => fn.value !== fieldItem.value);
    this.fieldItemsSelected.set(this.objectKey, fieldItemsSelected);
    this.fieldItems.push(fieldItem);
    const fieldItemsLoaded = this.fieldItemsLoaded.get(this.objectKey);
    this.fieldItems.sort( (fn1, fn2) => fieldItemsLoaded.indexOf(fn1) - fieldItemsLoaded.indexOf(fn2));

    this.propagateChange(this.convertToSetting(fieldItemsSelected));
  }

  convertToSetting(fieldItems: SelectItem[]) {
    const result = [];
    fieldItems.forEach(fi => result.push(fi.value));
    return result;
  }

  convertFromSetting(fieldIds: string[]) {
    const result: SelectItem[] = [];
    if (fieldIds) {
      const fieldsLoaded = this.fieldItemsLoaded.get(this.objectKey);
      fieldIds.forEach(fieldId => {
        const field: SelectItem = fieldsLoaded.find(fl => fl.value === fieldId);
        if (field) {
          result.push(field);
        }
      });
    }

    return result;
  }

  writeValue(setting: any): void {
    this.fieldIdsFromSetting = setting;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
  }
}
