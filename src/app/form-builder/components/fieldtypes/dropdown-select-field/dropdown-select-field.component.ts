import { TranslateService } from '@ngx-translate/core';
import { BaseFieldComponent } from "../base-field/base-field.component";
import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { FieldSettingsChangeService } from 'src/app/form-builder/services/field-settings-change.service';
import { FieldSettings } from '../../../../shared/models/field-settings/field-setting';
import { ApiService } from 'src/app/shared/services/api.service';
import { FieldType } from 'src/app/shared/models/field-type';
import { isObject } from 'src/app/shared/libs/typechecks';

@Component({
  selector: 'app-dropdown-select-field',
  templateUrl: './dropdown-select-field.component.html',
  styleUrls: ['./dropdown-select-field.component.scss']
})
export class DropdownSelectFieldComponent extends BaseFieldComponent implements OnInit {
  optionSelected: any;
  options: SelectItem[] = [];
  multiSelect = false;
  placeholder = 'Choose';
  defaultPlaceholder = 'Choose';
  fieldId = '';
  generateOptions: any;

  constructor(private fieldSettingsChangeService: FieldSettingsChangeService,
              private translateService: TranslateService,
              private apiService: ApiService) {
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

  async setOptions() {
    this.options = [];
    this.fieldId = this.formMetaField.Name;
    const optionsObjectOrString = this.formMetaField.getSettingValue(FieldSettings.Options);

    if (isObject(optionsObjectOrString)) {
      this.setOptionsFromObject(optionsObjectOrString as unknown as object);
    }
    if (typeof optionsObjectOrString === 'string') {
      this.setOptionsFromString(optionsObjectOrString);
    }

    this.multiSelect = false;
    if (this.formMetaField.getSettingValueAsBoolean(FieldSettings.MultipleSelect)) {
      this.multiSelect = true;
    }

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
      this.options.push({ label: optionsObject[key], value: key });
    });
  }

  getValue() {
    return this.optionSelected;
  }

  setValue(value) {
    if (this.multiSelect) {
      if (!Array.isArray(value)) {
        this.optionSelected = this.splitStringAndRemoveSpacesInArray(value);
      } else {
        this.optionSelected = value.filter(el => (el as string).trim() !== '');
      }
    } else {
      if (Array.isArray(value)) {
        value = value[0];
      }
      this.optionSelected = value;
    }
  }

  async onLanguageChange(data: any) {
    this.generateOptions = [];
    const getData = await this.apiService.getFieldItem(data.value);
    getData.forEach(element => {
      this.generateOptions.push(element.Label);
    });

    this.fieldCollectionService.get().forEach((component: any) => {
      if (component.formMetaField.type === FieldType.DropdownField && component.formMetaField.name === 'Field') {
        component.setOptions(this.generateOptions);
      }
    });
  }
}
