import { Component, inject, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { BaseWidgetComponent } from '../base-widget/base-widget.component';
import { CardModule } from 'primeng/card';
import { RecordItem, RecordItemFieldValue } from '../../../shared/models/entities/record-item';
import { ApiService } from '../../../shared/services/api.service';
import { BusyService } from '../../../shared/services/busy.service';
import { RoutingService } from '../../../shared/services/routing.service';
import { ButtonModule } from 'primeng/button';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload-button-widget',
  standalone: true,
    imports: [CardModule, NgIf, ButtonModule, FileUploadModule, TranslateModule, CheckboxModule, FormsModule],
  templateUrl: './upload-button-widget.component.html',
  styleUrl: './upload-button-widget.component.scss'
})
export class UploadButtonWidgetComponent extends BaseWidgetComponent implements OnInit {
    #apiService = inject(ApiService);
    #busyService = inject(BusyService);
    #routingService = inject(RoutingService);
    fileUpload: FileUpload;
    public showSyncOCRBtn: boolean;
    public syncOCR: boolean;
    public showSuccessMSG: boolean;
    private uploadedFiles: any[] = [];
    private isRequiredShowErr: boolean;
    private fileUploadConfig = [];
    private redirectToRecordSetItem: boolean;

    public ngOnInit(): void {
        this.redirectToRecordSetItem = this.widgetConfig()['RedirectToRecordSetItem'];
        if(this.widgetConfig()['FieldSyncOCR']){
            this.showSyncOCRBtn = true;
        }
    }

    async onUpload(event: FileUploadHandlerEvent, fileUpload: FileUpload){
        event.files.forEach((file) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = (reader: any) => {
                this.uploadedFiles.push(reader.target.result);
            };
        });

        if (this.uploadedFiles) {
            const uploadButtonItemSlug = await this.#apiService.createRecordItem(this.widgetConfig()['RecordSet']);
            const recordItem = new RecordItem();
            recordItem.Fields.push(this.setRecordItemField(this.widgetConfig()['FieldUpload'], this.uploadedFiles));

            if (this.syncOCR) {
                recordItem.Fields.push(this.setRecordItemField(this.widgetConfig()['FieldSyncOCR'], 'Yes'));
            }
            recordItem.RecordSlug = this.widgetConfig()['RecordSet'];

            this.#busyService.show();
            const result = await this.#apiService.postRecordItem(uploadButtonItemSlug, recordItem);
            if(result['itemSlug']){
                if (this.redirectToRecordSetItem && result['itemSlug']){
                    await this.#routingService.toRecordItemEdit(result['itemSlug'], {listpage: 1});
                }else {
                    this.uploadedFiles = [];
                    fileUpload.clear();
                    this.showSuccessMSG = true;
                }
             }
            
            
            this.#busyService.hide();
        }
    }

    onRemove(fileUpload: FileUpload) {
        this.isRequiredShowErr = fileUpload && fileUpload.files && fileUpload.files.length <= 1;
    }

    onSelect(fileUpload: FileUpload) {
        const isContainFiles = fileUpload && fileUpload.files && fileUpload.files.length > 0;
        this.isRequiredShowErr = !isContainFiles;
    }

    private setRecordItemField(slug: string, value: any): RecordItemFieldValue {
        const recordItemField = new RecordItemFieldValue();
        recordItemField.Slug = slug;
        recordItemField.Value = value;
        return recordItemField;
    }
}
