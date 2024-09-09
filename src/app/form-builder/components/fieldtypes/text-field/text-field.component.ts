import { NumberFormatService } from '../../../../shared/services/number-format.service';
import { DateFormatService } from '../../../../shared/services/date-format.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { FieldSettingsChangeService } from 'src/app/form-builder/services/field-settings-change.service';
import { TextType } from 'src/app/shared/models/text-type';
import { FieldSettings } from '../../../../shared/models/field-settings/field-setting';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-text-field',
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss']
})
export class TextFieldComponent extends BaseFieldComponent implements OnInit {
  minValue: any;
  maxValue: any;
  value: any;
  dateFormat = 'dd.mm.yy';
  hourFormat = '24';
  showSeconds = true;

  @ViewChild('control', { static: false }) input: NgModel;

  inputType: TextType = TextType.Text;
  keyfilter = null;
  // TODO to avoid this a bit complicated enum-value-passing to the template those checks should maybe not be done in the template?
  dateTextTypes = [TextType.DateTime, TextType.Date];
  timeTextType = TextType.Time;
  dateTimeTextType = TextType.DateTime;
  unit: string = null;
  isReadOnly = false;

  constructor(private fieldSettingsChangeService: FieldSettingsChangeService,
              private dateFormatService: DateFormatService,
              private numberFormatService: NumberFormatService
              ) {
    super();
    this.fieldSettingsChangeService.listen().subscribe(_ => {
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
          this.addErrorMessage('Length must be at least ' + this.input.errors.minlength.requiredLength + ' chars');
        }
      }
    }
  }

  private setSettingOptions() {

    // settings for a date / time field
    this.dateFormat = (this.formMetaField.dateFormat) ?
        this.dateFormatService.php2jsFormatString(this.formMetaField.dateFormat) : this.dateFormat;
    this.hourFormat = (this.formMetaField.hourFormat) ? this.formMetaField.hourFormat : this.hourFormat;
    this.showSeconds = this.formMetaField.showSeconds;

    // other settings
    this.inputType = this.formMetaField.getSettingValue(FieldSettings.TextType);
    this.isReadOnly = this.formMetaField.getSettingValueAsBoolean(FieldSettings.ReadOnly);
    this.keyfilter =  /.*/;
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
      this.value = this.formatTimeValue(value);
    } else {
      if ((value != null) && (this.formMetaField.isDateOrTimeTextType()) && (value.length > 8)) {
        this.value = new Date(value);
      } else {
          if ((value !== null) && (this.inputType === TextType.Number)) {
            value = this.numberFormatService.formatForInputField(value);
          }
          this.value = value;
      }
    }
    this.onChange();
  }

  /**
   * Convert time string from backend to a time string the primeng calendar understands
   * This is specially needed when the user changed the format of the time field later on
   * e.g. when the user changes to show seconds = true, and the value from backend does not have the seconds,
   * the calendar component would give an error
   *
   */
  formatTimeValue(timeString: string): string {
    if (!timeString) {
      return timeString;
    }

    let result: string;
    const is12HourFormat = this.formMetaField.hourFormat === '12';
    const partsDelimiter = ':';

    const regex = /([0-9\:]*)[ ]?(AM|PM)?/;
    const matches = timeString.match(regex);
    const timePart = (matches[1]) ? matches[1] : timeString;  // timePart is the time only, without AM or PM
    const amOrPm = matches[2];                                // matches[2] can be 'AM' or 'PM', if present

    result = timePart;
    if (!this.formMetaField.showSeconds) {
      if (timePart.indexOf(partsDelimiter) !== timePart.lastIndexOf(partsDelimiter)) {
        result = timePart.substr(0, timePart.lastIndexOf(partsDelimiter));
      }
    } else {
      if (timePart.length === 5) {
        result = timePart + ':00';
      }
    }

    // tslint:disable-next-line: radix
    const hour = parseInt(timePart.substr(0, 2));

    if (amOrPm) {
      if (is12HourFormat) {
        // 12 hour format
        result += ' '  + amOrPm;
      } else {
        // 24 hour format
        if (amOrPm === 'PM') {
          if (hour < 12) {
            result = this.changeHourInTimeString(result, (hour + 12), partsDelimiter);
          }
        } else {
          if (hour === 12) {
            result = this.changeHourInTimeString(result, (hour - 12), partsDelimiter);  // e.g. 12:00 AM === 00:00
          }
        }
      }
    } else {
      // we dont have an 'AM' or 'PM' in string
      if (is12HourFormat) {
        if (hour < 12) {
          if (hour < 1) {
            result = this.changeHourInTimeString(result, (hour + 12), partsDelimiter );
          }
          result += ' AM';
        } else {
          if (hour >= 13) {
            result = this.changeHourInTimeString(result, (hour - 12), partsDelimiter);
          }
          result += ' PM';
        }
      }
    }
    return result;
  }

  private changeHourInTimeString(timeString: string, newHour: number, partsDelimiter: string): string {
    return newHour + timeString.substr(timeString.indexOf(partsDelimiter));
  }

  onChange() {
    this.fieldCollectionService.onFieldValueChanged(this);
  }
}
