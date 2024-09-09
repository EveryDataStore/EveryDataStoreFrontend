import { Component, OnInit, Output, Input} from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { MessageUtilService } from '../../../../shared/services/message-util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../../../../shared/services/menu.service';
import { TranslateService } from '@ngx-translate/core';
import { BusyService } from '../../../../shared/services/busy.service';
import { RoutingService } from '../../../../shared/services/routing.service';
import { PermissionsService } from '../../../../shared/services/permissions.service';
import { SettingsService } from 'src/app/shared/services/settings.service';

@Component({
  selector: 'app-record-item-notes',
  templateUrl: './record-item-notes.component.html',
  styleUrls: ['./record-item-notes.component.scss']
})
export class RecordItemNotesComponent implements OnInit {
  
  @Input() notes: any[];
  public recordSlug: any;
  public note: any;
  isNoteManagerActive = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private apiService: ApiService,
              private menuService: MenuService,
              private translateService: TranslateService,
              private busyService: BusyService,
              private messageService: MessageUtilService,
              private routingService: RoutingService,
              private permissionsService: PermissionsService,
              private settingsService: SettingsService) { }

    ngOnInit() {
      this.recordSlug = this.route.snapshot.paramMap.get('itemSlug');
      this.isNoteManagerActive = this.settingsService.isActiveApp('everynotemanager');
    }


    async getAllNote() {
        this.notes = await this.apiService.getRecordItemNotes(this.recordSlug);
    }

    async addNote() {
        this.busyService.show();
        const note = {
          Fields: {
            Content: this.note,
            RecordSetItem: this.recordSlug
          }
        };
        const res = await this.apiService.addRecordItemNote(note);
        if (res) {
          this.messageService.showSuccess( await this.translateService.get('note_added').toPromise());
          this.note = ''; 
          await this.getAllNote();
        }
        this.busyService.hide();
    }

  async deleteNote(noteSlug) {
    this.busyService.show();
    const res = await this.apiService.deleteRecordItemNote(noteSlug);
    if (res) {
      this.messageService.showSuccess(await this.translateService.get('note_added').toPromise());
      await this.getAllNote();
    }
    this.busyService.hide();
  } 
}
