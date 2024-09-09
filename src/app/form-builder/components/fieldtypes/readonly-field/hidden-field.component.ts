import { FieldSettings } from 'src/app/shared/models/field-settings/field-setting';
import { FieldSettingsChangeService } from 'src/app/form-builder/services/field-settings-change.service';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hidden-field',
  templateUrl: './hidden-field.component.html',
  styleUrls: ['./hidden-field.component.scss']
})
export class HiddenFieldComponent extends BaseFieldComponent implements OnInit {

  fieldSettingsHidden = FieldSettings.Hidden;

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
    this.setDefaultValue();
  }

  getValue() {
    return this.value;
  }

  setValue(value: any) {
    if (!value) {
      this.setDefaultValue();
    } else {
      this.value = value;
    }
  }
}
