import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { SaveType } from '../../shared/components/save-cancel-buttons/save-cancel-buttons.component';
import { Permissions } from '../../shared/services/permissions.service';
import { BusyService } from 'src/app/shared/services/busy.service';
import { MessageUtilService } from '../../shared/services/message-util.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { FieldCollectionService } from 'src/app/shared/services/field-collection.service';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ApiService } from 'src/app/shared/services/api.service';
import { FormMode } from 'src/app/form-builder/form-builder.component';
import { RoutingService } from 'src/app/shared/services/routing.service';
import { PermissionsService } from 'src/app/shared/services/permissions.service';
import { EventEmitterService } from '../../form-builder/services/event-emitter.service';
import * as $ from 'jquery';
import { RecordFormData } from '../../shared/models/entities/record-form-data';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-model-item',
  templateUrl: './admin-model-item.component.html',
  styleUrls: ['./admin-model-item.component.scss']
})
export class AdminModelItemComponent implements OnInit, AfterViewInit, OnDestroy {

  public FormModeEnum = FormMode;
  objectSlug: string;
  langDir: string;
  modelName = '';
  formData: RecordFormData;
  permissions: Permissions = new Permissions();
  isNewItem = false;
  dashboardPath: string;
  navigationSubscription: Subscription;
  fieldCollectionService: FieldCollectionService;

  constructor(private route: ActivatedRoute,
              private routingService: RoutingService,
              private apiService: ApiService,
              private messageService: MessageUtilService,
              private busyService: BusyService,
              private permissionsService: PermissionsService,
              private cdr: ChangeDetectorRef,
              private confirmationService: ConfirmationService,
              private translateService: TranslateService,
              private languageService: LanguageService,
              private router: Router,
              private eventEmitterService: EventEmitterService) {
    this.fieldCollectionService = new FieldCollectionService();
    this.dashboardPath = routingService.getDashboardPath();
    this.navigationSubscription = this.router.events.subscribe(async (e: any) => {
      if (e instanceof NavigationEnd) {
        await this.ngOnInit();
      }
    });
  }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.modelName = params['modelName'];
      this.permissions = await this.permissionsService.getPermissionsForModel(this.modelName);
      this.objectSlug = params['objectSlug'];
      if (this.objectSlug === undefined) {
        this.isNewItem = true;
      }
      await this.load();
    });
    this.langDir = this.languageService.getLangDir();
  }

  ngAfterViewInit() {
    if (this.modelName === 'EveryNotifyTemplate') {
      this.addInsertButtonForEveryNotifyTemplate();
    }
  }

  async onSaveClicked(saveType: SaveType) {
    this.busyService.show();
    try {
      const fields = this.fieldCollectionService.createFieldsForAdminSave();

      const recordItem = {};

      recordItem['Fields'] = fields;

      if (this.objectSlug !== undefined) {
        recordItem['Slug'] = this.objectSlug;
        await this.apiService.putModelObject(this.modelName, this.objectSlug, recordItem);
      } else {
        await this.apiService.postModelItem(this.modelName, recordItem);
      }

      if (saveType !== SaveType.SaveAndCopy) {
        this.messageService.showSuccess('Saved');
      }

      switch (saveType) {
        case SaveType.SaveAndExit:
          await this.routingService.toAdminModelItemsList(this.modelName);
          break;
        case SaveType.SaveAndNew:
          await this.toNewModelItem();
          break;
        case SaveType.SaveAndCopy:
          const data = await this.apiService.copyModelItem(this.modelName, this.objectSlug);
          await this.routingService.toAdminModelItemEdit(this.modelName, data.Slug);
          this.messageService.showSuccess('Copied');
          break;
        default:
      }
    } catch (e) {
      if (e.message) {
        this.messageService.showError(e.message);
      }
    }
    this.busyService.hide();
  }

  async onDeleteClicked() {
    if (!this.permissions.canDelete) {
      return;
    }

    this.confirmationService.confirm({
      header: await this.translateService.get('confirm.please-confirm').toPromise(),
      message: await this.translateService.get('confirm.really-delete-item').toPromise(),
      accept: async _ => {
        this.busyService.show();
        await this.apiService.deleteModelItem(this.modelName, this.objectSlug);
        await this.routingService.toAdminModelItemsList(this.modelName);
        this.busyService.hide();
        this.messageService.showSuccess(this.translateService.instant('item-deleted'));
      }
    });
  }

  async onCancelClicked() {
    await this.routingService.toAdminModelItemsList(this.modelName);
  }

  async onModelLinkClicked() {
    await this.routingService.toAdminModelItemsList(this.modelName);
  }

  async load() {
    this.busyService.show();
    this.formData = await this.apiService.getFormFieldsForModelObject(this.modelName, this.objectSlug) as RecordFormData;
    // const prevNext = await this.apiService.getPrevAndNextModelItem(this.modelName, this.objectSlug);
    this.busyService.hide();
  }

  addText() {
    const field1 = ($('#RecordSet').text()).replace(/^\s+|\s+$/g, '');

    const field2 = ($('#Field').text()).replace(/^\s+|\s+$/g, '');

    if (field1.toLowerCase() !== 'choose' && field2.toLowerCase() !== 'choose') {
      this.eventEmitterService.onFirstComponentButtonClick(field1 + '.' + field2);
    }
  }


  async onFormBuilt() {
    // setting values from formMetaField's value option
    this.fieldCollectionService.get().forEach(component => {
      if (component.formMetaField.value != null) {
        component.setValue(component.formMetaField.value);
      }
    });
  }

  private async toNewModelItem() {
    if (!this.permissions.canCreate) {
      return;
    }

    await this.routingService.toAdminModelNewItem(this.modelName);
  }

  private addInsertButtonForEveryNotifyTemplate() {
    setTimeout(() => {
      $('#Field').append(`<input type="submit" id="buttonclick" style="margin: 0;
        color: #ffffff;background-color: #0f97c7;border: 1px solid #0f97c7;
       font-size: 13px;border-radius: 2px;padding: 0.5em 1em;cursor: pointer;margin-left: 15px;" value="Insert" /> `);
      const element = document.getElementById('buttonclick');
      element.onclick = () => {
        $('#tempDiv').trigger('click');
      };
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

}
