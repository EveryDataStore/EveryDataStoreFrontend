import { RoutingService } from 'src/app/shared/services/routing.service';
import { ApiService } from './../../shared/services/api.service';
import { PermissionsService } from 'src/app/shared/services/permissions.service';
import { Permissions } from 'src/app/shared/services/permissions.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AppComponent } from '../../app.component';
import { AppMainComponent } from '../../app-main.component';
import { Menu, MenuType } from 'src/app/shared/models/entities/menu';
import { MenuService } from 'src/app/shared/services/menu.service';
import { LanguageService } from 'src/app/shared/services/language.service';



@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  animations: [
    trigger('inline', [
      state('hidden', style({
        height: '0px',
        overflow: 'hidden'
      })),
      state('visible', style({
        height: '*'
      })),
      state('hiddenAnimated', style({
        height: '0px',
        overflow: 'hidden'
      })),
      state('visibleAnimated', style({
        height: '*'
      })),
      transition('visibleAnimated => hiddenAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('hiddenAnimated => visibleAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})

export class AppMenuComponent implements OnInit {
  public avatar = '/assets/avatar/avatar-default.png';

  langDir: string ;
  adminLabel: string;
  dashboradLabel: string;
  accountLabel: string;
  mainMenuItems: any[] = [];
  userMenuItems: any[] = [];
  administrationMenuItems: any[] = [];
  permissions: Permissions = new Permissions();
  public user: any;

  constructor(private apiService: ApiService,
    private menuService: MenuService,
    public app: AppMainComponent,
    private authService: AuthService,
    private routingService: RoutingService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private permissionsService: PermissionsService) {

    this.menuService.reloadSource$.subscribe((menuType) => {
      if (menuType === MenuType.MainMenu) {
        this.createMainMenu();
      }
    });
    const lsValue = localStorage.getItem('user');
    if (!lsValue) { return; }
    let storageData = JSON.parse(JSON.parse(lsValue))
    this.langDir = this.languageService.getLangDir(storageData.Settings.Locale);
  }

  async ngOnInit() {
    await this.createMainMenu();
    this.user = await this.apiService.getUserInfo();
    this.permissions = await this.permissionsService.getPermissionsForModel('Menu');
    const userName = this.user.FirstName + ' ' + this.user.Surname;

    if (this.permissions.canViewUserMenu) {
      this.userMenuItems = [
        {
          label: userName, avatar: this.user.avatarURL ? this.user.avatarURL : this.avatar, icon: 'fas fa-user', routerLink: ['/'],
          items: []
        }
      ];
    } else {
      this.userMenuItems = [
        {
          label: 'Logout', avatar: this.user.avatarURL ? this.user.avatarURL : this.avatar, icon: 'fas fa-user', routerLink: ['/'],
          items: []
        }
      ];
    }

    await this.generateUserMenuItems();
    if (this.permissions.canViewAdminMenu) {
    this.adminLabel = await this.translateService.get('administration').toPromise();
      this.administrationMenuItems = [
        {
          label:  this.adminLabel, icon: 'fas fa-cog', routerLink: ['/'],
          items: await this.createAdminMenu()
        }
      ];
    }
  }

  async generateUserMenuItems() {
    if (this.permissions.canViewUserMenu) {
      const menus = await this.apiService.getUserMenu();
      const menuItems = Menu.menuArrayToMenuItems(menus, '');
      this.userMenuItems[0].items = this.userMenuItems[0].items.concat(menuItems);
    }
    this.userMenuItems[0].items.push({
      label: 'Logout', icon: 'pi pi-fw pi-sign-out', command: _ => {
        this.authService.logout();
      }
    });

  }

  async createMainMenu() {
    const menus = await this.apiService.getPrimaryMenu();
    const menuItems = Menu.menuArrayToMenuItems(menus);
    
    this.mainMenuItems = [
      { label: await this.translateService.get('dashboard').toPromise(), icon: 'fas fa-home', routerLink: [this.routingService.getDashboardPath()] }]
      .concat(menuItems);
  }

  async createAdminMenu() {
    const menus = await this.apiService.getAdminMenu();
    const menusFiltered = menus.filter(m => m.Parent === 0);

    const adminMenuItems = Menu.menuArrayToMenuItems(menusFiltered, 'admin');
    const databaseMenuItem = adminMenuItems.find(
      menuItem => (menuItem.controller.toLowerCase() === 'recordform' || menuItem.controller.toLowerCase() === 'record'));

    if (databaseMenuItem !== undefined) {
      databaseMenuItem.routerLink = '/records';
    }

    for( var i = 0; i < adminMenuItems.length; i++){
        if(adminMenuItems[i].routerLink[0].indexOf('/record/items/') > -1 ){
                    adminMenuItems[i].routerLink[0] = adminMenuItems[i].routerLink[0].replace(/\/admin/g, '')
        }

        if(adminMenuItems[i].items){
            for(var j=0; j <  adminMenuItems[i].items.length; j++){
                if(adminMenuItems[i].items[j].routerLink[0].indexOf('/record/items/') > -1 ){
                    adminMenuItems[i].items[j].routerLink[0] = adminMenuItems[i].items[j].routerLink[0].replace(/\/admin/g, '')
                 }
            }
        }
    }

    return adminMenuItems;
  }

  onMenuClick(event) {
    this.app.onMenuClick(event);
  }

  userMenuClicked(action: string) {
    switch (action) {
      case 'logout':
        this.authService.logout();
        break;
    }
  }
}
