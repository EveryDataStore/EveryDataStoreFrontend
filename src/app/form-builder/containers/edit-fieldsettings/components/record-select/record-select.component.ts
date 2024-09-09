import { BusyService } from './../../../../../shared/services/busy.service';
import { Record } from './../../../../../shared/models/entities/record';
import { ApiService } from './../../../../../shared/services/api.service';
import { ChangeDetectorRef, Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { RecordFormData } from 'src/app/shared/models/entities/record-form-data';

@Component({
  selector: 'app-record-select',
  templateUrl: './record-select.component.html',
  styleUrls: ['./record-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RecordSelectComponent),
      multi: true
    }
  ]
})
export class RecordSelectComponent implements OnInit, ControlValueAccessor {

  @Input()
  formData: RecordFormData;

  recordItems: SelectItem[] = [];

  recordSlugSelected = '';

  constructor(private apiService: ApiService, private busyService: BusyService, private cdr: ChangeDetectorRef) { }

  async ngOnInit() {
    this.busyService.show();

    const records = await this.apiService.getRecordsTitleAndSlugOnly();
    records.forEach(record => {
      //if (record.Slug !== this.formData.Slug) {
        this.recordItems.push({label: record.Title, value: record.Slug});
      //}
    });

    const tmp = this.recordSlugSelected;
    this.recordSlugSelected = null;
    setTimeout(_ => {this.recordSlugSelected = tmp; }, 1);

    this.busyService.hide();
  }

  writeValue(recordSlug: string): void {
    if (recordSlug != null) {
      this.recordSlugSelected = recordSlug;
    }
  }

  propagateChange = (_: any) => { };

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
  }

  onSelectedItemChanged() {
    this.propagateChange(this.recordSlugSelected);
  }

}
