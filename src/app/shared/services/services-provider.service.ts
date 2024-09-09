import { SettingsService } from './settings.service';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServicesProviderService {

  constructor(private translateService: TranslateService,
              private settingsService: SettingsService) { }

  public getTranslateService() {
    return this.translateService;
  }

  public getSettingsService() {
    return this.settingsService;
  }
}
