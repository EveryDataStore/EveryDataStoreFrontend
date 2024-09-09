import { TranslateService } from '@ngx-translate/core';
import { FormMetaField } from '../entities/form-meta-field';
import { FieldSettings } from '../field-settings/field-setting';
import { FieldType } from '../field-type';

export class CheckboxField extends FormMetaField {
    private yes = 'Yes';
    private no = 'No';

    constructor() {
        super();
        this.Type = FieldType.CheckboxField;

        this.setFieldSettingEdits([
            FieldSettings.Label,
            FieldSettings.DefaultValue,
            FieldSettings.Info,
            FieldSettings.Active,
            FieldSettings.ShowInResultList,
            FieldSettings.Required,
            FieldSettings.Options]);
    }

    public afterSetup() {
        this.yes = this.getTranslateService().instant('yes');
        this.no = this.getTranslateService().instant('no');
    }

    public formatValueForViewing(rawValue: any): string {
        if (typeof(rawValue) === 'string' || typeof(rawValue) === 'number') {
            return this.valToBooleanString(rawValue);
        } else {
            return super.formatValueForViewing(rawValue);
        }
    }

    private valToBooleanString(value) {
        const valNumber = value as number;
        return (valNumber === 1) ? this.yes : this.no;
    }
}
