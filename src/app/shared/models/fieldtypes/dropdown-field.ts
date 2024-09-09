import { FieldSettings } from '../field-settings/field-setting';
import { FormMetaField } from '../entities/form-meta-field';
import { FieldType } from '../field-type';

export class DropdownField extends FormMetaField {
    constructor() {
        super();
        this.Type = FieldType.DropdownField;
        this.setFieldSettingEdits([
            FieldSettings.Label,
            FieldSettings.Placeholder,
            FieldSettings.DefaultValue,
            FieldSettings.Info,
            FieldSettings.Active,
            FieldSettings.ShowInResultList,
            FieldSettings.Required,
            FieldSettings.MultipleSelect,
            FieldSettings.Options]);
    }
}
