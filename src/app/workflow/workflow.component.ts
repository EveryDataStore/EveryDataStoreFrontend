import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { LanguageService } from 'src/app/shared/services/language.service';
@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
  public taskStatus: any;
  langDir: string;
 isWorkflowAppActive = false;

  constructor(private router: Router,
      private settingsService: SettingsService,
      private translateService: TranslateService,
      private languageService: LanguageService
      ) {
  }

  async ngOnInit() {
    this.isWorkflowAppActive = this.settingsService.isActiveApp('everyworkflow');
    this.langDir = this.languageService.getLangDir();
  }

  workflowTasksEvent(e: any) {
    const Slug = e.Slug;
    this.taskStatus = e.taskStatus;
    this.router.navigate(['/workflow/tasks/' + Slug, {taskStatus: this.taskStatus}]);
  }
}
