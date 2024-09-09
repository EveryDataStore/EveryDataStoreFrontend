import { BusyService } from './../../../../../shared/services/busy.service';
import { ApiService } from 'src/app/shared/services/api.service';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { RecordFormData } from 'src/app/shared/models/entities/record-form-data';
import { FieldSetting } from 'src/app/shared/models/field-settings/field-setting';
import { SelectItem } from 'primeng/api';
import { FieldSettingNames } from 'src/app/shared/models/field-settings/field-setting-names';
import { FieldSettingValues } from 'src/app/shared/models/field-settings/field-setting-values';
import { SettingValuesChangeService } from '../../services/setting-values-change.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DisplayFieldsComponent } from '../display-fields/display-fields.component';

@Component({
  selector: 'app-field-mapping',
  templateUrl: './field-mapping.component.html',
  styleUrls: ['./field-mapping.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FieldMappingComponent),
      multi: true
    }
  ]
})
export class FieldMappingComponent implements OnInit, ControlValueAccessor  {

  constructor(private apiService: ApiService,
              private busyService: BusyService,
              private settingValuesChangeService: SettingValuesChangeService) { }

  @Input()
  editFields: FieldSetting[] = [];

  @Input()
  formData: RecordFormData;

  fieldItemsActualRecord: SelectItem[] = [];
  fieldItemsTarget: SelectItem[] = [];
  fieldIdSelectedActualRecord: string = null;
  fieldIdSelectedTarget: string = null;

  fieldMappings: [SelectItem, SelectItem][] = [];

  relationDataSetting: FieldSetting;
  modelSetting: FieldSetting;
  recordSetting: FieldSetting;

  allFieldItemsActualRecord: SelectItem[] = [];

  objectKey: string = null;
  fieldMappingsFromSetting: [] = [];

  propagateChange = (_: any) => { };

  async ngOnInit() {
    this.busyService.show();

    this.relationDataSetting = this.editFields.find(fs => fs.name === FieldSettingNames.RelationData);
    this.modelSetting = this.editFields.find(fs => fs.name === FieldSettingNames.Model);
    this.recordSetting = this.editFields.find(fs => fs.name === FieldSettingNames.Record);

    this.settingValuesChangeService.listen().subscribe(fs => {
      this.loadData();
    });
    await this.loadFieldsActualRecord();
    await this.loadData();

    this.busyService.hide();
  }

  async loadFieldsActualRecord() {
    const labels = await this.apiService.getRecordFieldActiveLabels(this.formData.Slug);
    this.allFieldItemsActualRecord = [];
    labels.forEach(l => this.allFieldItemsActualRecord.push({label: l['Label'], value: l['Slug']}));
  }

  async loadData() {
    const objectKey = this.getObjectKey();
    if (objectKey === this.objectKey) {
      return;
    }
    this.objectKey = objectKey;

    this.fieldItemsActualRecord = [];
    this.fieldItemsTarget = [];
    this.fieldMappings = [];

    // reset the fields of actual record
    this.fieldItemsActualRecord = this.allFieldItemsActualRecord;

    if (this.objectKey) {

      // load the mapped record or model fields
      if (this.relationDataSetting.value === FieldSettingValues.Record) {
        await this.loadRecordFieldNames(this.objectKey);
      }

      if (this.relationDataSetting.value === FieldSettingValues.Model) {
        await this.loadModelFieldNames(this.objectKey);
      }

      if (this.fieldMappingsFromSetting) {
        Object.keys(this.fieldMappingsFromSetting).forEach(fmsKey => {
          const fieldItemActualRecord = this.fieldItemsActualRecord.find(fiar => fiar.value === fmsKey);
          const fieldItemTarget = this.fieldItemsTarget.find(fit => fit.value === this.fieldMappingsFromSetting[fmsKey]);

          if (fieldItemActualRecord && fieldItemTarget) {
            this.fieldMappings.push([fieldItemActualRecord, fieldItemTarget]);
          }
        });
        this.resetFieldItemsActualRecordFromMappings();
      }
    }
  }

  async loadRecordFieldNames(recordSlug: string) {
    const labels = await this.apiService.getRecordFieldActiveLabels(recordSlug);
    const fieldItems = [];
    labels.forEach( l => fieldItems.push({label: l['Label'], value: l['Slug'] }));
    this.fieldItemsTarget = fieldItems;

  }

  async loadModelFieldNames(modelName: string) {
    const fields = await this.apiService.getModelSummaryFields(modelName);
    const fieldItems = [];
    Object.keys(fields).forEach(l => fieldItems.push({label: l, value: l}));
    this.fieldItemsTarget = fieldItems;
  }

  onAddBtnClicked() {
    if (!this.fieldIdSelectedTarget || !this.fieldIdSelectedActualRecord) {
      return;
    }

    this.fieldMappings.push([
      this.fieldItemsActualRecord.find(fi => fi.value === this.fieldIdSelectedActualRecord),
      this.fieldItemsTarget.find(fi => fi.value === this.fieldIdSelectedTarget)] );

    this.resetFieldItemsActualRecordFromMappings();

    this.fieldIdSelectedActualRecord = null;
    this.fieldIdSelectedTarget = null;

    this.propagateChange(this.convertToSetting());
  }

  onRemoveBtnClicked(fieldMapping) {
    this.fieldMappings = this.fieldMappings.filter(fm => fm !== fieldMapping);

    this.resetFieldItemsActualRecordFromMappings();
    this.propagateChange(this.convertToSetting());
  }


  resetFieldItemsActualRecordFromMappings() {
    let fieldItems = this.allFieldItemsActualRecord;
    this.fieldMappings.forEach(fm => {
      fieldItems = fieldItems.filter(fi => fi.value !== fm[0].value);
    });
    this.fieldItemsActualRecord = fieldItems;
  }

  private getObjectKey(): string {
    let objectKey = null;
    if (this.relationDataSetting.value === FieldSettingValues.Record) {
      if (this.recordSetting.value) {
          objectKey = this.recordSetting.value as string;
      }
    }

    if (this.relationDataSetting.value === FieldSettingValues.Model) {
      if (this.modelSetting.value) {
          objectKey =  this.modelSetting.value as string;
      }
    }
    return objectKey;
  }

  private convertToSetting() {
    const result = {};
    this.fieldMappings.forEach(fm => {
      result[fm[0].value] = fm[1].value;
    });

    return result;
  }

  writeValue(setting: any): void {
    this.fieldMappingsFromSetting = setting;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
  }

}
