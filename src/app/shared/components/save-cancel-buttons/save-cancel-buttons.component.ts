import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export enum SaveType {
  SaveAndStay,
  SaveAndExit,
  SaveAndNew,
  SaveAndCopy
}

@Component({
  selector: 'app-save-cancel-buttons',
  templateUrl: './save-cancel-buttons.component.html',
  styleUrls: ['./save-cancel-buttons.component.scss']
})
export class SaveCancelButtonsComponent implements OnInit {

  @Output()
  save = new EventEmitter<SaveType>();

  @Output()
  cancel = new EventEmitter();

  @Output()
  delete = new EventEmitter();

  @Input()
  disabled = false;

  @Input()
  showDeleteButton = false;

  @Input()
  showCopyButton = false;

  @Input()
  showSaveButton = true;

  @Input()
  showSaveAndExitButton = true;

  @Input()
  showSaveAndNewButton = true;

  saveTypeEnum = SaveType;

  showButtons = false;

  saveButtonLabel = '';
  saveAndExitButtonLabel = '';
  saveAndNewButtonLabel = '';
  deleteButtonLabel = '';
  cancelButtonLabel = '';
  copyButtonLabel = '';

  constructor(private translateService: TranslateService) { }

  async ngOnInit() {
    this.saveButtonLabel = await this.translateService.get('save').toPromise();
    this.saveAndExitButtonLabel = await this.translateService.get('save-and-exit').toPromise();
    this.saveAndNewButtonLabel = await this.translateService.get('save-and-new').toPromise();
    this.deleteButtonLabel = await this.translateService.get('delete').toPromise();
    this.cancelButtonLabel = await this.translateService.get('cancel').toPromise();
    this.copyButtonLabel = await this.translateService.get('save-and-copy').toPromise();
    this.showButtons = true;    // show buttons only after labels are set to avoid width problem
  }

  onSaveClicked(saveType: SaveType) {
    this.save.emit(saveType);
  }

  onCancelClicked() {
    this.cancel.emit();
  }

  onDeleteClicked() {
    this.delete.emit();
  }

}
