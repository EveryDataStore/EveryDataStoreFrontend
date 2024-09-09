import { FieldSettingsChangeService } from '../../../services/field-settings-change.service';
import { Component, OnInit } from '@angular/core';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { FieldSettings } from '../../../../shared/models/field-settings/field-setting';
import { isObject } from 'src/app/shared/libs/typechecks';

@Component({
  selector: 'app-checkbox-field',
  templateUrl: './checkbox-field.component.html',
  styleUrls: ['./checkbox-field.component.scss']
})
export class CheckboxFieldComponent extends BaseFieldComponent implements OnInit {

  optionSelected: any;
  isBinary = false;

  constructor(private fieldSettingsChangeService: FieldSettingsChangeService) {
    super();
    this.fieldSettingsChangeService.listen().subscribe(_ => {
      this.setSettingOptions();
    });
  }

  ngOnInit() {
    super.ngOnInit();
    this.setSettingOptions();
  }

  setSettingOptions() {
    this.isBinary = false;
    const options = this.formMetaField.getSettingValue(FieldSettings.Options);
    if (options === null) {
      this.isBinary = true;
    }

    this.setDefaultValue();
  }

  getOptions() {
    const options = this.formMetaField.getSettingValue(FieldSettings.Options);
    if ((options !== null)  && (typeof options === 'string')) {
      return this.splitStringAndRemoveSpacesInArray(options);
    } else {
      return options;
    }
  }

  getValue() {
    const options = this.getOptions();
    if (!this.isBinary) {
      const result = {};
      Object.keys(options).forEach(key => {
        if ((this.optionSelected != null) && (this.optionSelected.includes(key))) {
          result[key] = options[key];
        }
      });
      return result;
    } else {
      return ((this.optionSelected === true) || (this.optionSelected === 1));
    }
  }

  setValue(value) {
    if (value === '') {
      this.optionSelected = null;
      return;
    }
    if (this.isBinary) {
      if (typeof value === 'number') {
        value = this.numberToBoolean(value);
      }
      this.optionSelected = value;
    } else {
      if (typeof value === 'string') {
        this.optionSelected = this.splitStringAndRemoveSpacesInArray(value);
      } else if (isObject(value)) {
          this.optionSelected = Object.keys(value);
      } else if (Array.isArray(value)) {
        this.optionSelected = value.filter(el => (el as string).trim() !== '');
      }
    }
  }

  private numberToBoolean(val: number): boolean {
    return (val === 1);
  }

  private boolToNumber(val: boolean): number {
      return (val) ? 1 : 0;
  }

}
