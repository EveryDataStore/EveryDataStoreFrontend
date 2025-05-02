import {FieldSettings} from '../field-settings/field-setting';
import {FormMetaField} from '../entities/form-meta-field';
import {FieldType} from '../field-type';

export class TextField extends FormMetaField {
    constructor() {
        super();
        this.Type = FieldType.TextField;

        this.setFieldSettingEdits([
            FieldSettings.Label,
            FieldSettings.Placeholder,
            FieldSettings.DefaultValue,
            FieldSettings.Info,
            FieldSettings.Active,
            FieldSettings.ShowInResultList,
            FieldSettings.ShowInSearchFilter,
            FieldSettings.Required,
            FieldSettings.ReadOnly,
            FieldSettings.TextType,
            FieldSettings.Maxlength,
            FieldSettings.NumberType,
            FieldSettings.MoneyType,
            FieldSettings.DateFormat,
            FieldSettings.HourFormat,
            FieldSettings.ShowSeconds,
            FieldSettings.UnitType,
            FieldSettings.Summable,
            FieldSettings.SummablePrefix,
            FieldSettings.SummableSuffix,
        ]);
    }
}
