import {FormMetaField} from '../entities/form-meta-field';
import {FieldSettings} from '../field-settings/field-setting';
import {FieldType} from '../field-type';

export class TexteditorField extends FormMetaField {
    constructor() {
        super();
        this.type = FieldType.TexteditorField;

        this.setFieldSettingEdits([
            FieldSettings.Label,
            FieldSettings.Placeholder,
            FieldSettings.DefaultValue,
            FieldSettings.Info,
            FieldSettings.Active,
            FieldSettings.ShowInResultList,
            FieldSettings.ShowInSearchFilter,
            FieldSettings.Required,
        ]);
    }
}
