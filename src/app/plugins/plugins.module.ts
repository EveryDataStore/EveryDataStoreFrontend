import { SharedModule } from './../shared/shared.module';
import { FormBuilderModule } from './../form-builder/form-builder.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrimeNGModule } from './../primeng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CrmPluginComponent } from './crm/crm-plugin/crm-plugin.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { ViewFileDialogComponent } from './file-manager/view-file-dialog/view-file-dialog.component';

@NgModule({
  declarations: [FileManagerComponent],
  imports: [
    CommonModule,
    RouterModule,
    PrimeNGModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    FormBuilderModule,
    NgxDocViewerModule,
    SharedModule
  ],
  exports: [FileManagerComponent],
})
export class PluginsModule { }
