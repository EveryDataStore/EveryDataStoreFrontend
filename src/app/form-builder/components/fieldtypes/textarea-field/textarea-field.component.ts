import { BaseFieldComponent } from '../base-field/base-field.component';
import { Component, OnInit } from '@angular/core';
import { FieldSettingsChangeService } from 'src/app/form-builder/services/field-settings-change.service';
import { FieldSettings } from 'src/app/shared/models/field-settings/field-setting';

@Component({
  selector: 'app-textarea-field',
  templateUrl: './textarea-field.component.html',
  styleUrls: ['./textarea-field.component.scss']
})
export class TextareaFieldComponent extends BaseFieldComponent implements OnInit {

  value: any[];
  isReadOnly = false;

  constructor(private fieldSettingsChangeService: FieldSettingsChangeService ) {
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
    this.isReadOnly = this.formMetaField.getSettingValueAsBoolean(FieldSettings.ReadOnly);
    super.setDefaultValue();
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    this.value = value;
  }
}
