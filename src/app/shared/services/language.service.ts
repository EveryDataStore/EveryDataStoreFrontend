import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})

export class LanguageService {

  private defaultLang = 'de';

  constructor(private injector: Injector, private translateService: TranslateService) {}

  public initialize() {
    this.translateService.setDefaultLang(this.defaultLang);
  }

  public setLanguageFromLocale(locale: string) {
    if (locale.length >= 2) {
      const lang = locale.slice(0, 2);
      this.translateService.use(lang);
    }
  }

  public getLangDir( locale: string = null ){
    let rtl_languages: string[] = ['ar', 'arc','dv','fa','ha','he','khw','ks','ku','ps','ur','yi'];
    let split_locale: string[];
    let nice_locale: string;

    if(locale){
        split_locale = locale.split("_");
        nice_locale = split_locale[0];
    }

    if(rtl_languages.indexOf(this.translateService.currentLang) > -1 || rtl_languages.indexOf(nice_locale) > -1){
        return 'rtl';
    }
    return 'ltl';
   }
}
