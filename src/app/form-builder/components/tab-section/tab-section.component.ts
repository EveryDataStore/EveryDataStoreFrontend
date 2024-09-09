import { Component, Input, OnInit } from '@angular/core';
import { FormSection } from '../../../shared/models/entities/form-section';
import { FormMode } from '../../form-builder.component';
import { FieldCollectionService } from '../../../shared/services/field-collection.service';

@Component({
  selector: 'app-tab-section',
  templateUrl: './tab-section.component.html',
  styleUrls: ['./tab-section.component.scss']
})
export class TabSectionComponent implements OnInit {

  @Input()
  sections: FormSection [];

  @Input()
  formMode: FormMode;

  @Input()
  recordItemSlug: string;

  @Input()
  fieldCollectionService: FieldCollectionService;

  constructor() {
  }

  ngOnInit() {
  }

}
