import { TranslateService } from '@ngx-translate/core';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { FieldSettingsChangeService } from 'src/app/form-builder/services/field-settings-change.service';
import { FieldSettings } from '../../../../shared/models/field-settings/field-setting';
import { isObject } from 'src/app/shared/libs/typechecks';

@Component({
  selector: 'app-dropdown-field',
  templateUrl: './dropdown-field.component.html',
  styleUrls: ['./dropdown-field.component.scss']
})
export class DropdownFieldComponent extends BaseFieldComponent implements OnInit {

  optionSelected: any;
  options: SelectItem[] = [];
  multiSelect = false;
  placeholder = 'Choose';
  defaultPlaceholder = 'Choose';
  fieldId = '';

  constructor(private fieldSettingsChangeService: FieldSettingsChangeService,
              private translateService: TranslateService) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    this.fieldSettingsChangeService.listen().subscribe(_ => {
      this.setSettingOptions();
    });
    this.setSettingOptions();
  }

  setSettingOptions() {
    this.setOptions();
    this.setDefaultValue();
  }

  async setOptions(data: any = null) {
    this.options = [];
    this.fieldId = this.formMetaField.Name;
    if (data != null) {
      this.setValue(null);
      this.formMetaField.setSettingValue(FieldSettings.Options, data);
    }
    const optionsObjectOrString = this.formMetaField.getSettingValue(FieldSettings.Options);
    if (isObject(optionsObjectOrString)) {
      this.setOptionsFromObject(optionsObjectOrString as unknown as object);
    }
    if (typeof optionsObjectOrString === 'string') {
      this.setOptionsFromString(optionsObjectOrString);
    }

    this.multiSelect = this.formMetaField.getSettingValueAsBoolean(FieldSettings.MultipleSelect);

    if (this.formMetaField.getSettingValueAsString(FieldSettings.Placeholder) !== '') {
      this.placeholder = this.formMetaField.getSettingValueAsString(FieldSettings.Placeholder);
    } else {
      this.placeholder = await this.translateService.get('choose').toPromise();
    }
  }

  setOptionsFromString(optionsString: string) {
    const values = optionsString.split(',');
    values.forEach(value => {
      this.options.push({ label: value, value: value.trim() });
    });
  }

  setOptionsFromObject(optionsObject: object) {
    Object.keys(optionsObject).forEach(key => {
      let label = optionsObject[key];
      if (label == null) {
        label = '';
      }
      this.options.push({ label, value: key });
    });
  }

  getValue() {
    if (Array.isArray(this.optionSelected)) {
      // filter out crapy values which dont exist in our options (e.g. were already removed)
      return this.optionSelected.filter(valSelected => this.options.findIndex(o => o.value === valSelected) >= 0);
    } else {
      return this.optionSelected;
    }
  }

  setValue(value) {
    if (this.multiSelect) {
      if (!Array.isArray(value)) {
        this.optionSelected = this.splitStringAndRemoveSpacesInArray(value);
      } else {
        this.optionSelected =  value.filter(el => (el as string) !== '');
      }
    } else {
      if (Array.isArray(value)) {
        value = value[0];
      }
      this.optionSelected = String(value);
    }
  }

}
