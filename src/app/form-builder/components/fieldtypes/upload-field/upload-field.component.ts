import { FileInfo } from '../../../../shared/models/entities/file-info';
import { ViewFileDialogComponent } from '../../../../plugins/file-manager/view-file-dialog/view-file-dialog.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { ApiService } from '../../../../shared/services/api.service';
import { BusyService } from '../../../../shared/services/busy.service';
import { FieldSettingsChangeService } from '../../../services/field-settings-change.service';
import { FieldSettings } from '../../../../shared/models/field-settings/field-setting';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { FileUpload } from 'primeng/fileupload';


@Component({
  selector: 'app-upload-field',
  templateUrl: './upload-field.component.html',
  styleUrls: ['./upload-field.component.scss']
})
export class UploadFieldComponent extends BaseFieldComponent implements OnInit {
  public user: any;
  uploadedFiles: any[] = [];
  isRequiredShowErr = false;
  fileUpload: FileUpload;
  show = false;
  label = '';
  value: any;

  @ViewChild('viewFileDialog')
  viewFileDialog: ViewFileDialogComponent;

  constructor(
    private apiService: ApiService,
    private busyService: BusyService,
    private messageService: MessageService,
    private fieldSettingsChangeService: FieldSettingsChangeService,
    private confirmationService: ConfirmationService,
    private settingsService: SettingsService,
    private translateService: TranslateService) {
    super();
    this.fieldSettingsChangeService.listen().subscribe(_ => {
      this.setSettingOptions();
    });
    this.load();
  }

  ngOnInit() {
    super.ngOnInit();
    if(FieldSettings.UploadAccepts.options.length == 0){
         FieldSettings.UploadAccepts.options = this.settingsService.getUploadAllowedExtensions();
    }
    this.formMetaField.setSettingValue(FieldSettings.UploadMaxFile, this.settingsService.getUploadAllowedFileNumber());

    this.uploadCheckAcceptValue();
  }

  uploadCheckAcceptValue() {
    const oldValue = this.formMetaField.getSettingValue(FieldSettings.UploadAccepts);
    let newValue;
    if (oldValue && !this.inBuildMode && typeof oldValue !== 'object') {
      const splited = oldValue.split(',');
      if (splited) {
        const values = [];
        splited.forEach(item => {
          values.push('.' + item);
        });
        newValue = values.toString();
      } else {
        newValue = oldValue && oldValue.toString();
      }
      this.formMetaField.setSettingValue(FieldSettings.UploadAccepts, newValue);
    }
  }

    uploadCheckAllowdFileSizeValue(){
        
    }
  async load() {
    this.busyService.show();
    this.user = await this.apiService.getUserInfo();
    this.busyService.hide();
    this.label = this.formMetaField.getSettingValue(FieldSettings.Label);
  }

  public onUpload(event: any, fileUpload: FileUpload) {
    // const fileReader = new FileReader();

    for (let i = 0; i < event.files.length; i++) {
      const file = event.files[i];
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = (reader: any) => {
        this.uploadedFiles.push(reader.target.result);
      };
    }

    this.fileUpload = fileUpload;
  }

  setSettingOptions() {
    super.setDefaultValue();
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    this.value = value;
  }

  async deleteFile(slug) {
    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-item').toPromise(),
      accept: async _ => {
        const deleted = await this.apiService.deleteFile(slug);
        if (deleted === 'Success') {
          this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Deleted' });
          this.removeFileFromValue(slug);
        }
      }
    });
  }

  removeFileFromValue(slug) {
    for (let i = 0; i < this.value.length; i++) {
     if (this.value[i].Slug === slug) {
          this.value.splice(i, 1);
          return;
      }
    }
  }

  onRemove(fileUpload: FileUpload) {
    const isContainFiles = fileUpload && fileUpload.files && fileUpload.files.length <= 1;
    if (isContainFiles) {
      this.isRequiredShowErr = true;
    } else {
      this.isRequiredShowErr = false;
    }
  }

  onSelect(fileUpload: FileUpload) {
    const isContainFiles = fileUpload && fileUpload.files && fileUpload.files.length > 0;
    if (isContainFiles) {
      this.isRequiredShowErr = false;
    } else {
      this.isRequiredShowErr = true;
    }
  }

  async onFileClicked(fileInfo: FileInfo) {
    await this.viewFileDialog.show(fileInfo);
  }

  onFileDeleted(fileSlug: string) {
    this.removeFileFromValue(fileSlug);
  }
}
