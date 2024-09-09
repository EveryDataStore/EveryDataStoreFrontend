import { ServicesProviderService } from '../../../shared/services/services-provider.service';
import { RecordFormData } from '../../../shared/models/entities/record-form-data';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { FieldSettingsChangeService } from '../../services/field-settings-change.service';
import { FormMetaFieldFactory } from '../../../shared/models/entities/form-meta-field-factory';
import { DragndropService } from '../../services/dragndrop.service';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormColumn } from 'src/app/shared/models/entities/form-column';
import { FormFieldType } from 'src/app/shared/models/entities/form-field-type';
import { FormMode } from '../../form-builder.component';
import { FormMetaField } from 'src/app/shared/models/entities/form-meta-field';
import { EditFieldsettingsComponent } from '../../containers/edit-fieldsettings/edit-fieldsettings.component';
import { FieldType } from '../../../shared/models/field-type';
import { FieldSettingNames } from 'src/app/shared/models/field-settings/field-setting-names';
import { BusyService } from '../../../shared/services/busy.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { isObject } from 'src/app/shared/libs/typechecks';
import { FieldCollectionService } from '../../../shared/services/field-collection.service';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss']
})
export class ColumnComponent implements OnInit {

  @Input()
  column: FormColumn;

  @Input()
  fieldCollectionService: FieldCollectionService;

  @Input()
  formMode: FormMode;
  public FormModeEnum = FormMode;

  @Input()
  formData: RecordFormData;

  @Input()
  recordItemSlug: string;

  @Output()
  deleteColumn = new EventEmitter<any>();

  @ViewChild('editFieldsettingsComponent')
  editFieldsettingsComponent: EditFieldsettingsComponent;

  inBuildMode = false;
  langDir: string;
  fieldType = FieldType;
  fieldSettingName = FieldSettingNames;

  // edit field properties
  editFieldsettingsDialogVisible = false;
  fieldToEdit: FormMetaField;

  // dragndrop properties
  dragFieldtypeStarted = false;
  dragFieldStarted = false;
  fieldTypeDragged: FormFieldType;

  public isDrag = false;

  constructor(
    private dragndropService: DragndropService,
    private fieldSettingsChangeService: FieldSettingsChangeService,
    private confirmationService: ConfirmationService,
    private busyService: BusyService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private servicesProviderService: ServicesProviderService) {

    this.dragndropService.dragStart.subscribe((fieldType: any) => {
      if (isObject(fieldType)) {
        this.dragFieldtypeStarted = true;
        this.fieldTypeDragged = fieldType;
      }
    });

    this.dragndropService.dragEnd.subscribe(() => {
      this.isDrag = false;
    });

    this.dragndropService.dragEnd.subscribe(_ => {
      this.dragFieldtypeStarted = false;
      this.dragFieldStarted = false;
    });
  }

  ngOnInit() {
    this.langDir = this.languageService.getLangDir();
    this.inBuildMode = (this.formMode === FormMode.Build);
    this.column.Fields.forEach(field => {
      if (field.name === 'Avatar') {
        field.type = FieldType.UploadField;
      }
    });
  }

  onFieldTypeDropped(event) {
    const field = FormMetaFieldFactory.createNew(this.fieldTypeDragged.Slug, this.servicesProviderService);
    if (field !== undefined) {
      this.column.Fields.push(field);
    }
    this.fieldToEdit = field;
    this.editFieldsettingsDialogVisible = true;
  }

  editButtonClicked(field: FormMetaField) {
    this.fieldToEdit = field;
    this.editFieldsettingsDialogVisible = true;
  }

  async deleteFieldClicked(field: FormMetaField) {
    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-field').toPromise(),
      accept: _ => {
        const index = this.column.Fields.indexOf(field);
        this.column.Fields.splice(index, 1);
      }
    });
  }

  onSaveSettingsClicked() {
    this.editFieldsettingsComponent.saveValuesToField();
    this.fieldSettingsChangeService.onChange();
    this.editFieldsettingsDialogVisible = false;
  }

  deleteColumnClicked() {
    this.deleteColumn.emit();
  }

  onDragStart() {
    this.dragndropService.dragStartName('field');
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
