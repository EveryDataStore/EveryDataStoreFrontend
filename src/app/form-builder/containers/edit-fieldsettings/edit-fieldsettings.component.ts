import { SettingValuesChangeService } from './services/setting-values-change.service';
import { Component, OnInit, Input } from '@angular/core';
import { FormMetaField } from 'src/app/shared/models/entities/form-meta-field';
import { FieldSetting, FieldSettings } from 'src/app/shared/models/field-settings/field-setting';
import { FieldSettingEditType } from 'src/app/shared/models/field-settings/field-setting-edit-type';
import { RecordFormData } from 'src/app/shared/models/entities/record-form-data';

@Component({
  selector: 'app-edit-fieldsettings',
  templateUrl: './edit-fieldsettings.component.html',
  styleUrls: ['./edit-fieldsettings.component.scss']
})
export class EditFieldsettingsComponent implements OnInit {

  constructor(private settingValuesChangeService: SettingValuesChangeService) { }

  @Input()
  field: FormMetaField;

  @Input()
  formData: RecordFormData;

  editFields: FieldSetting[] = [];

  editType = FieldSettingEditType;

  ngOnInit() {
    this.editFields = this.field.getFieldSettingEdits();
  }

  checkCondition(editField: FieldSetting) {
    if (editField.showForTextTypes) {
      const textTypeField = this.editFields.find(ef => ef === FieldSettings.TextType);
      const found = editField.showForTextTypes.find(tt => tt === textTypeField.value);
      return found;
    }

    if (!editField.conditions) {
      return true;
    }

    return editField.conditions.check(this.editFields);
  }

  checkDisabledConditions(editField: FieldSetting) {
    if (!editField.disabledConditions) {
      return false;
    }
    return editField.disabledConditions.check(this.editFields);
  }

  onChange(fieldSetting: FieldSetting) {
    this.settingValuesChangeService.onChange(fieldSetting);
  }

  saveValuesToField() {
    this.editFields.forEach((editField) => {
      if (this.checkCondition(editField)) {

        let value: any;
        if (editField.converter !== undefined) {
          editField.value = editField.converter.fromStringToValue(editField.value as string);
        }

        value = editField.value;

        if (value === null) {
          if (editField.type === FieldSettingEditType.Dropdown) {
            value = editField.options[0].value;
          }
        }

        this.field.setSettingValue(editField, value);
      } else {
        this.field.setSettingValue(editField, '');
      }
    });
  }
}


