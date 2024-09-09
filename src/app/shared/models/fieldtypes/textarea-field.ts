import { FormMetaField } from '../entities/form-meta-field';
import { FieldSettings } from '../field-settings/field-setting';
import { FieldType } from '../field-type';

export class TextareaField extends FormMetaField {
    constructor() {
        super();
        this.Type = FieldType.TextareaField;

        this.setFieldSettingEdits([
            FieldSettings.Label,
            FieldSettings.Placeholder,
            FieldSettings.DefaultValue,
            FieldSettings.Info,
            FieldSettings.Active,
            FieldSettings.ShowInResultList,
            FieldSettings.Required,
            FieldSettings.ReadOnly
        ]);
    }
}
