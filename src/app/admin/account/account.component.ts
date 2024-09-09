import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormData } from '../../shared/models/entities/form-data';
import { ApiService } from '../../shared/services/api.service';
import { BusyService } from '../../shared/services/busy.service';
import { FormMode } from '../../form-builder/form-builder.component';
import { FieldCollectionService } from '../../shared/services/field-collection.service';
import { MessageUtilService } from '../../shared/services/message-util.service';
import { BaseFieldComponent } from 'src/app/form-builder/components/fieldtypes/base-field/base-field.component';
import { RecordFormData } from '../../shared/models/entities/record-form-data';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {

  public type: any;
  public formData: RecordFormData;
  public user: any;
  public FormModeEnum = FormMode;
  public modelName = 'Member';
  public fieldCollectionService: FieldCollectionService;

  constructor(private route: ActivatedRoute,
              private apiService: ApiService,
              private busyService: BusyService,
              private messageService: MessageUtilService,
              private translateService: TranslateService,
              private router: Router,
              private confirmationService: ConfirmationService) {
    this.fieldCollectionService = new FieldCollectionService();
    this.fieldCollectionService.listenToFieldValueChanged().subscribe(field => this.onFieldValueChanged(field));

    this.route.params.subscribe(params => {
      this.type = params['type'];
    });
    this.load();
  }

  async ngOnInit() {
  }

  async load() {
    this.busyService.show();
    this.user = await this.apiService.getUserInfo();
    this.formData = await this.apiService.getFormFieldsForModelObject('Member', this.user.Slug) as RecordFormData;
    this.busyService.hide();
  }

  async onFormBuilt() {
    // setting values from formMetaField's value option
    this.fieldCollectionService.get().forEach(component => {
      if (component.formMetaField.value != null) {
        component.setValue(component.formMetaField.value);
      }
    });
  }

  async onSaveClicked() {
    this.busyService.show();
    const fields: any = this.fieldCollectionService.createFieldsForAdminSave();
    try {
      let validiationFlag = true;
      if (fields.ConfirmPassword === '' && fields.Password === '' && fields.OldPassword === '') {
        delete fields.ConfirmPassword;
        delete fields.Password;
        delete fields.OldPassword;
        validiationFlag = false;
      } else if (fields.ConfirmPassword === '' || fields.Password === '' || fields.OldPassword === '') {
        this.messageService.showError('Please fill out all password fields');
        this.busyService.hide();
        return;
      }

      if (validiationFlag) {
        const result = await this.apiService.validatePassword(fields.Email, fields.OldPassword, fields.Password);
        const oldPasswordCheck = await this.apiService.currentUserCheckOldPassword(fields.Email, fields.OldPassword);
        if (result !== 'OK' || oldPasswordCheck !== 'OK') {
          if (result !== 'OK') {
            this.messageService.showError(result);
          }
          if (oldPasswordCheck !== 'OK') {
            await this.showErrorOldPasswordIsWrong();
          }
        } else {
          await this.apiService.changePassword(fields.Email, fields.OldPassword, fields.Password);
          await this.postFields(fields);
        }
      } else {
        await this.postFields(fields);
      }


    } catch (e) {
      this.messageService.showError(e.message);
    }
    const currentDataStore = fields.CurrentDataStore;
    await this.apiService.reloadUserSettings(currentDataStore);

    this.busyService.hide();

    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.reload-required').toPromise(),
      accept: async _ => {
        window.location.reload();
      }
    });
  }

  async postFields(fields) {
    if (fields.ConfirmPassword !== fields.Password) {
      this.messageService.showError('Password mismatch');
    } else {
      const recordItem = {};
      recordItem['Fields'] = fields;
      if (this.user.Slug !== undefined) {
        recordItem['Slug'] = this.user.Slug;
        await this.apiService.putModelObject(this.modelName, this.user.Slug, recordItem);
      } else {
        await this.apiService.postModelItem(this.modelName, recordItem);
      }

      this.messageService.showSuccess('Saved');

      this.router.navigate(['/account/' + this.type]);
    }
  }

  private async onFieldValueChanged(field: BaseFieldComponent) {
    if (field.formMetaField.Name === 'OldPassword') {
      const value = field.value;
      if (value == null) {
        return;
      }

      if ((value as string).trim() === '') {
        return;
      }

      // Control of the old password input is provided. and whether it is correct or not the backend is queried
      const user: any = await this.apiService.getUserInfo();
      const result = await this.apiService.currentUserCheckOldPassword(user.Email, value);

      if (result !== 'OK') {
        await this.showErrorOldPasswordIsWrong();
      }
    }
  }

  ngOnDestroy() {
  }

  private async showErrorOldPasswordIsWrong() {
    this.messageService.showError(await this.translateService.get('Old password is wrong').toPromise());
  }

}
