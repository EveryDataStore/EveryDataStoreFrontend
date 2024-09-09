import { SettingsService } from 'src/app/shared/services/settings.service';
import { ApiService } from './shared/services/api.service';
import { MenuService } from './shared/services/menu.service';
import { BusyService } from './shared/services/busy.service';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TokenResult } from './shared/models/entities/token-result';
import { environment } from 'src/environments/environment';
import { PermissionsService } from './shared/services/permissions.service';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'EveryDataStore';
  themeColor = 'blue';
  langDir: string;

  constructor(private busyService: BusyService,
   private languageService: LanguageService,
              private titleService: Title) {
    this.titleService.setTitle(this.title);
    const lsValue = localStorage.getItem('user');
    if (!lsValue) { return; }
    let storageData = JSON.parse(JSON.parse(lsValue))
    this.langDir = this.languageService.getLangDir(storageData.Settings.Locale);
  }

  async ngOnInit() {
  }

  isBusy(): boolean {
    return this.busyService.isBusy;
  }

}
