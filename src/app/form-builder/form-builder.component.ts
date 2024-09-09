import { FieldCollectionService } from '../shared/services/field-collection.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { DragndropService } from './services/dragndrop.service';
import { ApiService } from '../shared/services/api.service';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormFieldType } from '../shared/models/entities/form-field-type';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { FormSection } from '../shared/models/entities/form-section';
import { FormColumn } from '../shared/models/entities/form-column';
import { RecordFormData } from '../shared/models/entities/record-form-data';
import { LanguageService } from 'src/app/shared/services/language.service';
import { delay } from 'rxjs/operators';

export enum FormMode {
  Build, Use
}

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit, OnChanges {

  @Input()
  formData: RecordFormData;

  @Input()
  fieldCollectionService: FieldCollectionService;

  @Input()
  recordSlug: string;

  @Input()
  recordItemSlug: string;

  @Input()
  parentRecordItemSlug: string;

  @Input()
  isAccount: boolean;

  @Input()
  formMode: FormMode = FormMode.Build;

  @Input()
  isSubForm = false;

  @Input()
  subFormOrder: number;

  @Input()
  subRecordItemSlugs: string[] = [];

  @Input()
  autoOpenFieldSlug = '';

  @Output()
  formBuilt = new EventEmitter<boolean>();

  FormModeEnum = FormMode;

  formFieldTypes: FormFieldType[];
  faCoffee = faCoffee;
  langDir = '';
  public isDrag = false;

  constructor(private apiService: ApiService,
              private confirmationService: ConfirmationService,
              private dragndropService: DragndropService,
              private translateService: TranslateService,
              private languageService: LanguageService) {
    this.dragndropService.dragEnd.subscribe(() => {
      this.isDrag = false;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['formData']) {
      if (this.formData && !this.formData.Sections || this.formData.Sections.length <= 0) {
        this.onAddSectionClicked();
      }
    }
  }

  async ngOnInit() {
    this.langDir = this.languageService.getLangDir();

    this.formData.getFormMetaFields().forEach(field => {
      if (field.slug === this.autoOpenFieldSlug) {
        field.autoOpen = true;
      }
    });

    if (!this.isSubForm) {
      this.fieldCollectionService.clear();
      this.fieldCollectionService.mainRecordItemSlug = this.recordItemSlug;
    } else {
      this.fieldCollectionService.addSubFormRecordItemSlug(this.recordItemSlug, this.subFormOrder);
    }

    if (this.formMode === FormMode.Build) {
      this.formFieldTypes = await this.apiService.getFormFieldTypes();
      const readonlyField = this.formFieldTypes.find(fft => fft.Slug === 'readonlyfield');
      readonlyField.Title = 'Hidden Field';
      this.fixIconStrings();
    }

    delay(1);
    this.formBuilt.emit(true);
  }

  onAddSectionClicked() {
    const section = new FormSection();
    section.Columns.push(new FormColumn());
    this.formData.Sections.push(section);
  }

  async deleteSection(section: FormSection) {
    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-section').toPromise(),
      accept: _ => {
        const index = this.formData.Sections.indexOf(section);
        this.formData.Sections.splice(index, 1);
      }
    });
  }

  /**
   * Drag n drop
   */
  onFieldDragStart(fieldType: FormFieldType) {
    this.dragndropService.dragStarted(fieldType);
  }

  onFieldDragEnd() {
    this.dragndropService.dragEnded();
  }

  /**
   * Some icon strings from the api are still old font awesome names. Will be fixed here until we get back newer versions.
   */
  private fixIconStrings() {
    this.formFieldTypes.forEach(formFieldType => {
      if (formFieldType.FontIconCls === 'fa fa-file-text-o') {
        formFieldType.FontIconCls = 'fa fa-align-justify';
      }
      formFieldType.FontIconCls = formFieldType.FontIconCls.replace('-o', '');
    });
  }

  onDragStart() {
    this.dragndropService.dragStartName('section');
  }

  onDropSuccess() {
    this.dragndropService.dragEnded();
  }

  onDragEnd() {
    this.dragndropService.dragEnded();
  }

  mouseover() {
    if (!this.isDrag) {
      this.isDrag = true;
    }
  }

  mouseleave() {
    if (this.isDrag) {
      this.isDrag = false;
    }
  }

}
