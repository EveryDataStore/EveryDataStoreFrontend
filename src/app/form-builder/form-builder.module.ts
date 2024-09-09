import { ViewFileDialogComponent } from '../plugins/file-manager/view-file-dialog/view-file-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { FieldSettingsChangeService } from './services/field-settings-change.service';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeNGModule } from '../primeng.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilderComponent } from './form-builder.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SectionComponent } from './components/section/section.component';
import { ColumnComponent } from './components/column/column.component';
import { DragndropService } from './services/dragndrop.service';
import { TextareaFieldComponent } from './components/fieldtypes/textarea-field/textarea-field.component';
import { TexteditorFieldComponent } from './components/fieldtypes/texteditor-field/texteditor-field.component';
import { TextFieldComponent } from './components/fieldtypes/text-field/text-field.component';
import { CheckboxFieldComponent } from './components/fieldtypes/checkbox-field/checkbox-field.component';
import { DropdownFieldComponent } from './components/fieldtypes/dropdown-field/dropdown-field.component';
import { HiddenFieldComponent } from './components/fieldtypes/readonly-field/hidden-field.component';
import { BaseFieldComponent } from './components/fieldtypes/base-field/base-field.component';
import { EditFieldsettingsComponent } from './containers/edit-fieldsettings/edit-fieldsettings.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { EventEmitterService } from './services/event-emitter.service';
import { DropdownSelectFieldComponent } from './components/fieldtypes/dropdown-select-field/dropdown-select-field.component';
import { TabSectionComponent } from './components/tab-section/tab-section.component';
import { UploadFieldComponent } from './components/fieldtypes/upload-field/upload-field.component';
import { RecordSelectComponent } from './containers/edit-fieldsettings/components/record-select/record-select.component';
import { ModelSelectComponent } from './containers/edit-fieldsettings/components/model-select/model-select.component';
import { DisplayFieldsComponent } from './containers/edit-fieldsettings/components/display-fields/display-fields.component';
import { FieldMappingComponent } from './containers/edit-fieldsettings/components/field-mapping/field-mapping.component';
import { RelationFieldComponent } from './components/fieldtypes/relation-field/relation-field/relation-field.component';
import { CrmPluginComponent } from '../plugins/crm/crm-plugin/crm-plugin.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { ItemsTableModule } from '../items-table/items-table.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DndModule } from '../dnd/dnd.module';

@NgModule({
  declarations: [
    // Plugin components used in form builder are declared here, because we cannot import module:
    // crm component uses formbuilder and formbuilder uses crm component -> cycle
    CrmPluginComponent,
    ViewFileDialogComponent,

    // Other components
    FormBuilderComponent,
    SectionComponent,
    TabSectionComponent,
    ColumnComponent,
    TextareaFieldComponent,
    TextFieldComponent,
    CheckboxFieldComponent,
    HiddenFieldComponent,
    BaseFieldComponent,
    DropdownFieldComponent,
    EditFieldsettingsComponent,
    TexteditorFieldComponent,
    DropdownSelectFieldComponent,
    UploadFieldComponent,
    RecordSelectComponent,
    ModelSelectComponent,
    DisplayFieldsComponent,
    FieldMappingComponent,
    RelationFieldComponent
  ],
  imports: [
    CommonModule,
    PrimeNGModule,
    SharedModule,
    TranslateModule,
    FormsModule,
    FontAwesomeModule,
    PrimeNGModule,
    FormsModule,
    TranslateModule,
    CKEditorModule,
    NgxDocViewerModule,
    ReactiveFormsModule,
    ItemsTableModule,
    DragDropModule,
    DragDropModule,
    DndModule
  ],
  providers: [DragndropService, FieldSettingsChangeService, EventEmitterService],
  exports: [FormBuilderComponent, ViewFileDialogComponent]
})
export class FormBuilderModule { }
