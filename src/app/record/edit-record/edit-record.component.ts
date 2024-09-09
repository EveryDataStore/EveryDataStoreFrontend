import { ConfirmationService } from 'primeng/api';
import { SaveType } from '../../shared/components/save-cancel-buttons/save-cancel-buttons.component';
import { Permissions, PermissionsService } from 'src/app/shared/services/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { RoutingService } from '../../shared/services/routing.service';
import { MenuService } from '../../shared/services/menu.service';
import { MessageUtilService } from '../../shared/services/message-util.service';
import { BusyService } from '../../shared/services/busy.service';
import { ApiService } from '../../shared/services/api.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CustomRecordFormData } from 'src/app/shared/models/entities/custom-record-form-data';
import { Menu, MenuType } from 'src/app/shared/models/entities/menu';
import { Group } from 'src/app/shared/models/entities/group';
import { Subscription } from 'rxjs';
import { FieldCollectionService } from '../../shared/services/field-collection.service';

@Component({
  selector: 'app-edit-record',
  templateUrl: './edit-record.component.html',
  styleUrls: ['./edit-record.component.scss']
})
export class EditRecordComponent implements OnInit, OnDestroy {

  recordFormData: CustomRecordFormData;
  recordSlug: string;
  recordTitle: string;
  recordVersion: string;
  recordVersions: any[];
  rootMenus: Menu[];
  groups: Group[];

  rootMenuSelected: Menu;
  groupsSelected: Group[] = [];
  permissions: Permissions = new Permissions();
  newItem = false;
  dashboardPath: string;
  langDir: string;
  navigationSubscription: Subscription;
  fieldCollectionService: FieldCollectionService;

  // tab view
  activeIndex: number;

  constructor(private route: ActivatedRoute,
              private apiService: ApiService,
              private menuService: MenuService,
              private translateService: TranslateService,
              private languageService: LanguageService,
              private busyService: BusyService,
              private messageService: MessageUtilService,
              private routingService: RoutingService,
              private confirmationService: ConfirmationService,
              private router: Router,
              private permissionsService: PermissionsService) {
    this.fieldCollectionService = new FieldCollectionService();
    this.dashboardPath = routingService.getDashboardPath();
    this.navigationSubscription = this.router.events.subscribe(async (e: any) => {
      if (e instanceof NavigationEnd) {
        await this.loadData();
      }});
  }

  async ngOnInit() {
    await this.loadData();
    this.langDir = this.languageService.getLangDir();
  }

  async loadData() {
    this.busyService.show();

    this.permissions = await this.permissionsService.getPermissionsForModel('Record');
    this.recordSlug = this.route.snapshot.paramMap.get('slug');
    this.recordVersion = this.route.snapshot.paramMap.get('recordVersion') ? this.route.snapshot.paramMap.get('recordVersion') : '1';
    this.rootMenus = await this.apiService.getPrimaryMenu();
    this.groups = await this.apiService.getGroups();

    if (this.recordSlug) {
        this.route.queryParamMap.subscribe(async () => {
          this.recordFormData = await this.apiService.getRecordFormData(this.recordSlug, null, this.recordVersion, null);
          this.recordFormData.processAfterLoad();

          this.recordFormData.Record.Slug = this.recordSlug;
          this.recordVersions =  this.recordFormData.Record.Versions;

          this.recordTitle = this.recordFormData.Record.Title;
          if (this.recordFormData.Record.MenuParentSlug) {
            this.rootMenuSelected = this.rootMenus.find(m => m.Slug === this.recordFormData.Record.MenuParentSlug);
          }
          this.groupsSelected = this.groups.filter(g => this.recordFormData.Record.Groups.includes(g.Slug));
        });
    } else {
      this.newItem = true;
      this.recordFormData = new CustomRecordFormData();
      this.recordTitle = await this.translateService.get('new').toPromise();
    }

    this.busyService.hide();
  }


  async onSaveClicked(saveType: SaveType) {
    const errorMessages = this.validate();
    if (errorMessages.length > 0) {
      this.messageService.showError(errorMessages.join('\n'));
      return;
    }

    if (this.recordFormData.Record.ShowInMenu) {
      if (this.rootMenuSelected) {
        this.recordFormData.Record.MenuParentSlug = this.rootMenuSelected.Slug;
      } else {
        this.recordFormData.Record.MenuParentSlug = '';
      }
    }
    this.recordFormData.Record.Groups = this.groupsSelected.map(g => g.Slug);
    await this.apiService.postRecordFormData(this.recordSlug, this.recordFormData.prepareForPost());
    this.newItem = false;

    this.messageService.showSuccess('Saved');

    this.menuService.reloadMenu(MenuType.MainMenu);

    switch (saveType) {
      case SaveType.SaveAndExit:
        await this.routingService.toRecordsList();
        break;
      case SaveType.SaveAndNew:
        await this.routingService.toNewRecord();
        break;
      default:
    }
  }

  private validate(): string[] {
    const errorMessages: string[] = [];
    if (this.recordFormData.Record.Title.trim().length === 0) {
      errorMessages.push('Title must not be empty');
    }
    return errorMessages;
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
        await this.apiService.deleteRecord(this.recordSlug);
        await this.routingService.toRecordsList();
        this.busyService.hide();
        this.messageService.showSuccess(this.translateService.instant('item-deleted'));
      }
    });
  }

  async onCancelClicked() {
    await this.routingService.toRecordsList();
  }

  async onRecordsListLinkClicked() {
    await this.routingService.toRecordsList();
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
}
