import { FormMetaField } from 'src/app/shared/models/entities/form-meta-field';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-field-label',
  templateUrl: './field-label.component.html',
  styleUrls: ['./field-label.component.scss']
})
export class FieldLabelComponent implements OnInit {

  @Input()
  field: FormMetaField;

  constructor() { }

  ngOnInit(): void {
  }

}
