import { PermissionsService, Permissions } from 'src/app/shared/services/permissions.service';
import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageUtilService } from '../../../../shared/services/message-util.service';
import { BusyService } from '../../../../shared/services/busy.service';
import { RoutingService } from './../../../../shared/services/routing.service';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'src/app/shared/services/settings.service';

@Component({
  selector: 'app-record-item-versions',
  templateUrl: './record-item-versions.component.html',
  styleUrls: ['./record-item-versions.component.scss']
})
export class RecordItemVersionsComponent implements OnInit {

  itemSlug: string;
  isVersionHistoryActive = false;

  @Input() versions: any[];
  permissions: Permissions = new Permissions();

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private messageService: MessageUtilService,
              private busyService: BusyService,
              private routingService: RoutingService,
              private translateService: TranslateService,
              private settingsService: SettingsService,
              private permissionsService: PermissionsService) {

    this.itemSlug = this.route.snapshot.paramMap.get('itemSlug');

  }

    async ngOnInit() {
        this.isVersionHistoryActive = this.settingsService.isActiveApp('everyversionhistory');
        this.permissions = await this.permissionsService.getPermissionsForModel('RecordItem');
    }

    async showVersion(itemSlug, version) {
       this.busyService.show();
       this.routingService.toRecordItemView(itemSlug,{}, version);
       this.busyService.hide();
     }

    async rollback(version) {
      this.busyService.show();
      const res = await this.apiService.rollbackRecordItem(this.itemSlug, version);
      if (res) {
        this.messageService.showSuccess( await this.translateService.get('rollbacksuccess').toPromise() );
        window.location.reload();
      }
      this.busyService.hide();
    }
}
