import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { AppMenuComponent } from '../menu/menu.component';
import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { AppMainComponent } from '../../app-main.component';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {

  userMenuModel: any[] = [];
  langDir: string;

  constructor(public app: AppMainComponent,
              public root: AppComponent,
              private authService: AuthService,
              private router: Router,
              public translateService: TranslateService,
              private languageService: LanguageService
              ) {
                const lsValue = localStorage.getItem('user');
                if (!lsValue) { return; }
                let storageData = JSON.parse(JSON.parse(lsValue))
                this.langDir = this.languageService.getLangDir(storageData.Settings.Locale);
                
               }

  ngOnInit() {
    ;
    this.userMenuModel = [
      /*{
          label: 'Profile', icon: 'pi pi-fw pi-user'
      },
      {
          label: 'Settings', icon: 'pi pi-fw pi-cog', action: 'settings'
      },
      {
          label: 'Messages', icon: 'pi pi-fw pi-envelope'
      },
      {
          label: 'Notifications', icon: 'pi pi-fw pi-bell'
      },*/
      {
          label: 'Logout', icon: 'pi pi-fw pi-sign-out', action: 'logout'
      }
  ];
  }

  userMenuClicked(action: string) {
    switch (action) {
      case 'logout': this.authService.logout();
                     break;
      case 'settings': this.router.navigate(['/user-settings']);
                       break;
    }
  }

  homeClicked() {
    this.router.navigate(['/']);
  }

}
