import { FieldSettings } from '../field-settings/field-setting';
import { FormMetaField } from '../entities/form-meta-field';
import { FieldType } from '../field-type';

export class UploadField extends FormMetaField {
  constructor() {
    super();
    this.Type = FieldType.UploadField;

    this.setFieldSettingEdits([
      FieldSettings.Label,
      FieldSettings.Info,
      FieldSettings.UploadMaxSize,
      FieldSettings.MultipleSelect,
      FieldSettings.Active,
      FieldSettings.ShowInResultList,
      FieldSettings.Required,
      FieldSettings.UploadAccepts]);
  }
}

