import { BusyService } from './../../../../../shared/services/busy.service';
import { SelectItem } from 'primeng/api';
import { ApiService } from 'src/app/shared/services/api.service';
import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-model-select',
  templateUrl: './model-select.component.html',
  styleUrls: ['./model-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ModelSelectComponent),
      multi: true
    }
  ]
})
export class ModelSelectComponent implements OnInit, ControlValueAccessor  {

  models: SelectItem[] = [];
  modelSelected;


  propagateChange = (_: any) => { };


  constructor(private apiService: ApiService, private busyService: BusyService) { }

  async ngOnInit() {
    this.busyService.show();

    const modelNames = await this.apiService.getModelNamesAllowedForUserSelection();
    modelNames.forEach(modelName => {
      this.models.push({label: modelName, value: modelName});
    });

    const tmp = this.modelSelected;
    this.modelSelected = null;
    setTimeout(_ => { this.modelSelected = tmp; }, 1);

    this.busyService.hide();
  }

  writeValue(modelName: any): void {
    if (modelName != null) {
      this.modelSelected = modelName;
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
  }

  onSelectedItemChanged() {
    this.propagateChange(this.modelSelected);
  }

}
