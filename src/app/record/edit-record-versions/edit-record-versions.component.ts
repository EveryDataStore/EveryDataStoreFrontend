import { PermissionsService, Permissions } from 'src/app/shared/services/permissions.service';
import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageUtilService } from '../../shared/services/message-util.service';
import { BusyService } from '../../shared/services/busy.service';
import { RoutingService } from './../../shared/services/routing.service';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-edit-record-versions',
  templateUrl: './edit-record-versions.component.html',
  styleUrls: ['./edit-record-versions.component.scss']
})
export class EditRecordVersionsComponent implements OnInit {
  recordSlug: string;
  itemSlug: string;
 
  @Input() versions: any[];


  public isDetail = false;
  isVersionHistoryActive = false;
  permissions: Permissions = new Permissions();
  //@Output() showEmit = new EventEmitter<any>();


  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private messageService: MessageUtilService,
              private busyService: BusyService,
              private routingService: RoutingService,
              private translateService: TranslateService,
              private settingsService: SettingsService,
              private permissionsService: PermissionsService) {
    this.recordSlug = this.route.snapshot.paramMap.get('slug');
    this.itemSlug = this.route.snapshot.paramMap.get('itemSlug');
  }

    async ngOnInit() {
       this.isVersionHistoryActive = this.settingsService.isActiveApp('everyversionhistory');
       this.permissions = await this.permissionsService.getPermissionsForModel('Record');
    }

    async showVersion(recordSlug, version) {
       if(!this.isVersionHistoryActive){ return; }
       this.busyService.show();
       this.routingService.toRecordEdit(recordSlug,{}, version);
       this.busyService.hide();
     }

    async rollback(version) {
      if(!this.isVersionHistoryActive){ return; }
      this.busyService.show();
      const res = await this.apiService.rollbackRecord(this.recordSlug, version);
      if (res) {
        this.messageService.showSuccess(  await this.translateService.get('rollbacksuccess').toPromise() );
        window.location.reload();
      }
      this.busyService.hide();
    }
}
