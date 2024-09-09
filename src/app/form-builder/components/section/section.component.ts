import { TranslateService } from '@ngx-translate/core';
import { MessageUtilService } from '../../../shared/services/message-util.service';
import { FormColumn } from '../../../shared/models/entities/form-column';
import { FormSection } from '../../../shared/models/entities/form-section';
import { LanguageService } from 'src/app/shared/services/language.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { FormMode } from '../../form-builder.component';
import { DragndropService } from '../../services/dragndrop.service';
import { RecordFormData } from 'src/app/shared/models/entities/record-form-data';
import { FieldCollectionService } from '../../../shared/services/field-collection.service';


@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements OnInit {

  @Input()
  section: FormSection;

  @Input()
  formData: RecordFormData;

  @Input()
  fieldCollectionService: FieldCollectionService;

  @Input()
  recordItemSlug: string;

  @Input()
  formMode: FormMode;
  FormModeEnum = FormMode;

  @Output()
  deleteSection = new EventEmitter<FormSection>();

  maxColumnsAllowed = 4;
  langDir = '';
  isDrag = false;

  constructor(private messageService: MessageUtilService,
              private confirmationService: ConfirmationService,
              private translateService: TranslateService,
              private languageService: LanguageService,
              private dragndropService: DragndropService) {
    this.dragndropService.dragEnd.subscribe(() => {
      this.isDrag = false;
    });
  }

  ngOnInit() {
    this.langDir = this.languageService.getLangDir();
  }

  onAddColumnClicked() {
    if (this.section.Columns.length < this.maxColumnsAllowed) {
      const column = new FormColumn();
      this.section.Columns.push(column);
    } else {
      this.messageService.showError('Not more than 4 columns allowed!');
    }
  }

  isAddColumnBtnDisabled() {
    return (this.section.Columns.length >= this.maxColumnsAllowed) ? 'none' : 'block';
  }

  async deleteColumn(column) {
    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-column').toPromise(),
      accept: _ => {
        const index = this.section.Columns.indexOf(column);
        this.section.Columns.splice(index, 1);
      }
    });
  }

  async onDeleteSectionClicked() {
    this.deleteSection.emit(this.section);
  }

  getCssClassForColumns() {
    const colCount = this.section.Columns.length;
    const classAppendix = (12 / colCount);

    return 'sm:col-' + classAppendix + ' col-12';
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
