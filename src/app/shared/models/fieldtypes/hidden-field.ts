import { FormMetaField } from '../entities/form-meta-field';
import { FieldSettings } from '../field-settings/field-setting';
import { FieldType } from '../field-type';

export class HiddenField extends FormMetaField {
    constructor() {
        super();
        this.Type = FieldType.HiddenField;

        this.setFieldSettingEdits([
            FieldSettings.Label,
            FieldSettings.DefaultValue,
            FieldSettings.Active,
            FieldSettings.ShowInResultList]);
    }
}
