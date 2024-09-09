import { BusyService } from './../../../shared/services/busy.service';
import { Group } from './../../../shared/models/entities/group';
import { MessageUtilService } from './../../../shared/services/message-util.service';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FileData } from './../../../shared/models/entities/file-data';
import { ApiService } from 'src/app/shared/services/api.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { FileInfo } from '../../../shared/models/entities/file-info';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-view-file-dialog',
  templateUrl: './view-file-dialog.component.html',
  styleUrls: ['./view-file-dialog.component.scss']
})
export class ViewFileDialogComponent implements OnInit {

  @Input()
  showDialog = false;

  @Input()
  fileData: FileData;

  @Output()
  fileDeleted = new EventEmitter<string>();

  loaded = false;

  fileSlug: string;

  isFile = false;
  fileLink = '';
  langDir: string = '';
  newNoteText = '';
  showPermissionGroups = false;

  groups: SelectItem[] = [];
  selectedViewerGroups: string[] = [];
  selectedEditorGroups: string[] = [];

  detailDialogDatapanelVisible = true;

  constructor(private apiService: ApiService,
              private busyService: BusyService,
              private translateService: TranslateService,
              private languageService: LanguageService,
              private confirmationService: ConfirmationService,
              private messageService: MessageUtilService) {
   }

  ngOnInit(): void {
    this.langDir = this.languageService.getLangDir();
  }

  public async show(fileInfo: FileInfo) {
    await this.loadFileData(fileInfo.Slug);
    this.showDialog = true;
  }

  onDocumentLoaded() {
  }

  async onSaveFormClicked() {
    await this.apiService.postEditFileData(this.fileData);
    this.messageService.showSuccess(await this.translateService.get('Saved').toPromise());
  }

  async addNewNote() {
    await this.apiService.postAddNoteToFile(this.fileSlug, this.newNoteText);
    await this.loadFileData();
  }

  async deleteNote(noteSlug: string) {
    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-note').toPromise(),
      accept: async _ => {
        await this.apiService.postDeleteNote(noteSlug);
        await this.loadFileData();
      }
    });
  }

  async deleteFile() {
    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-item').toPromise(),
      accept: async _ => {
        const deleted = await this.apiService.deleteFile(this.fileSlug);
        if (deleted === 'Success') {
          this.showDialog = false;
          this.messageService.showInfo('File deleted');
          this.fileDeleted.emit(this.fileSlug);
        }
      }
    });
  }

  deleteCurrentSlug() {}

  printFile() {}

  onPermissionTypeChanged(showPermissionGroups: boolean) {
    this.showPermissionGroups = showPermissionGroups;
  }


  showDialogMaximized(event) {
  }

  closeDialog() {
    this.showDialog = false;
  }

  async loadFileData(fileSlug: string = null) {
    if (fileSlug) {
      this.fileSlug = fileSlug;
    }
    this.loaded = false;
    this.busyService.show();

    await this.loadGroups();
    this.fileData = await this.apiService.getFileData(this.fileSlug);

    this.isFile = (['svg', 'jpeg', 'jpg', 'png'].indexOf(
      this.fileData.Name.toLowerCase().split('.')[this.fileData.Name.split('.').length - 1])) === -1 ? true : false;
    this.fileLink = this.fileData.Link;

    this.busyService.hide();
    this.loaded = true;
  }

  private async loadGroups() {
    this.groups = [];
    const groups = await this.apiService.getGroups();
    groups.forEach(group => {
      this.groups.push({ label: group.Title, value: group.Slug });
    });
  }

}
