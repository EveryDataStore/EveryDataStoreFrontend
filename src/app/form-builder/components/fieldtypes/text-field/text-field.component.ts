import {NumberFormatService} from '../../../../shared/services/number-format.service';
import {DateTimeFormatService} from '../../../../shared/services/date-time-format.service';
import {Component, OnInit, ViewChild, input} from '@angular/core';
import {BaseFieldComponent} from '../base-field/base-field.component';
import {FieldSettingsChangeService} from 'src/app/form-builder/services/field-settings-change.service';
import {TextType} from 'src/app/shared/models/text-type';
import {FieldSettings} from '../../../../shared/models/field-settings/field-setting';
import {NgModel} from '@angular/forms';

@Component({
    selector: 'app-text-field',
    templateUrl: './text-field.component.html',
    styleUrls: ['./text-field.component.scss'],
})
export class TextFieldComponent extends BaseFieldComponent implements OnInit {
    public showErrors = input(true);

    @ViewChild('control', {static: false}) input: NgModel;

    public minValue: any;
    public maxValue: any;
    public value: any;
    public dateFormat = 'dd.mm.yy';
    public hourFormat = '24';
    public showSeconds = true;

    public inputType: TextType = TextType.Text;
    public keyfilter = null;
    // TODO to avoid this a bit complicated enum-value-passing to the template those checks should maybe not be done in the template?
    public dateTextTypes = [TextType.DateTime, TextType.Date];
    public timeTextType = TextType.Time;
    public dateTimeTextType = TextType.DateTime;
    public unit: string = null;
    public isReadOnly = false;

    constructor(
        private fieldSettingsChangeService: FieldSettingsChangeService,
        private dateFormatService: DateTimeFormatService,
        private numberFormatService: NumberFormatService
    ) {
        super();
        this.fieldSettingsChangeService.listen().subscribe((_) => {
            this.setSettingOptions();
        });
    }

    ngOnInit() {
        super.ngOnInit();

        this.minValue = localStorage.getItem('Min');
        this.maxValue = localStorage.getItem('Max');

        this.setSettingOptions();
    }

    validate() {
        super.validate();

        if (this.input !== undefined) {
            if (this.input.invalid) {
                if (this.input.errors.email) {
                    this.addErrorMessage('Not a valid email address');
                }
                if (this.input.errors.minlength) {
                    this.addErrorMessage(
                        'Length must be at least ' + this.input.errors.minlength.requiredLength + ' chars'
                    );
                }
            }
        }
    }

    private setSettingOptions() {
        // settings for a date / time field
        this.dateFormat = this.formMetaField.dateFormat
            ? this.dateFormatService.php2jsFormatStringForPrimeNg(this.formMetaField.dateFormat)
            : this.dateFormat;
        this.hourFormat = this.formMetaField.hourFormat ? this.formMetaField.hourFormat : this.hourFormat;
        this.showSeconds = this.formMetaField.showSeconds;

        // other settings
        this.inputType = this.formMetaField.getSettingValue(FieldSettings.TextType);
        this.isReadOnly = this.formMetaField.getSettingValueAsBoolean(FieldSettings.ReadOnly);
        this.keyfilter = /.*/;
        if (this.inputType === TextType.Number) {
            this.minValue = 1;
            if (this.formMetaField.getSettingValue(FieldSettings.NumberType) === 'integer') {
                this.keyfilter = 'int';
            } else {
                this.keyfilter = 'num';
            }
        }
        super.setDefaultValue();
        this.setUnit();
    }

    private setUnit() {
        this.unit = this.formMetaField.getUnit();
    }

    getValue() {
        if (this.formMetaField.isDateTextType() && this.value) {
            // set hours to 12 because its automatically converted to UTC, which the backend does not yet understand
            // (e.g. 6.7. 00:00 would be 5.7. 22:00 UTC)
            (this.value as Date).setHours(12);
        }
        return this.value;
    }

    setValue(value: string) {
        if (this.formMetaField.isTimeTextType()) {
            this.value = this.dateFormatService.formatTimeValue(
                value,
                this.formMetaField.is12HourFormat,
                this.formMetaField.showSeconds
            );
        } else {
            if (value != null && this.formMetaField.isDateOrTimeTextType() && value.length > 8) {
                this.value = new Date(value);
            } else {
                if (value !== null && this.inputType === TextType.Number) {
                    value = this.numberFormatService.formatForInputField(value);
                }
                this.value = value;
            }
        }
        this.onChange();
    }

    onChange() {
        this.fieldCollectionService.onFieldValueChanged(this);
    }
}
