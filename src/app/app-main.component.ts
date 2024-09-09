import { Component, OnInit } from '@angular/core';
import { MenuService } from './shared/services/menu.service';

@Component({
  selector: 'app-main',
  templateUrl: './app-main.component.html',
  styleUrls: ['./app-main.component.scss']
})
export class AppMainComponent implements OnInit {
  /** Our properties */
  title = 'ngDmsFrontend';
  actualLang = 'en';
  /** Our properties end */

  menuMode = 'horizontal';

  overlayMenuActive: boolean;

  staticMenuDesktopInactive: boolean;

  staticMenuMobileActive: boolean;

  layoutMenuScroller: HTMLDivElement;

  lightMenu = true;

  topbarColor = 'layout-topbar-blue';

  menuClick: boolean;

  userMenuClick: boolean;

  notificationMenuClick: boolean;

  rightMenuClick: boolean;

  resetMenu: boolean;

  menuHoverActive: boolean;

  topbarUserMenuActive: boolean;

  topbarNotificationMenuActive: boolean;

  rightPanelMenuActive: boolean;

  inlineUser: boolean;

  isRTL: boolean;

  configActive: boolean;

  configClick: boolean;

  profileClick: boolean;

  inlineUserMenuActive = false;

  constructor(private menuService: MenuService) {
  }

  async ngOnInit() {}

  onLayoutClick() {
    if (!this.userMenuClick) {
      this.topbarUserMenuActive = false;
    }

    if (!this.notificationMenuClick) {
      this.topbarNotificationMenuActive = false;
    }

    if (!this.rightMenuClick) {
      this.rightPanelMenuActive = false;
    }

    if (!this.profileClick && this.isSlim()) {
      this.inlineUserMenuActive = false;
    }

    if (!this.menuClick) {
      if (this.isHorizontal() || this.isSlim()) {
        this.menuService.reset();
      }

      if (this.overlayMenuActive || this.staticMenuMobileActive) {
        this.hideOverlayMenu();
      }

      this.menuHoverActive = false;
      this.unblockBodyScroll();
    }

    if (this.configActive && !this.configClick) {
      this.configActive = false;
    }

    this.configClick = false;
    this.userMenuClick = false;
    this.rightMenuClick = false;
    this.notificationMenuClick = false;
    this.menuClick = false;
    this.profileClick = false;
  }

  onMenuButtonClick(event) {
    this.menuClick = true;
    this.topbarUserMenuActive = false;
    this.topbarNotificationMenuActive = false;
    this.rightPanelMenuActive = false;

    if (this.isOverlay()) {
      this.overlayMenuActive = !this.overlayMenuActive;
    }

    if (this.isDesktop()) {
      this.staticMenuDesktopInactive = !this.staticMenuDesktopInactive;
    } else {
      this.staticMenuMobileActive = !this.staticMenuMobileActive;
      if (this.staticMenuMobileActive) {
        this.blockBodyScroll();
      } else {
        this.unblockBodyScroll();
      }
    }

    event.preventDefault();
  }

  onMenuClick($event) {
    this.menuClick = true;
    this.resetMenu = false;
  }

  hideMobileMenu() {
    this.staticMenuMobileActive = false;
  }

  onTopbarUserMenuButtonClick(event) {
    this.userMenuClick = true;
    this.topbarUserMenuActive = !this.topbarUserMenuActive;

    this.hideOverlayMenu();

    event.preventDefault();
  }

  onTopbarNotificationMenuButtonClick(event) {
    this.notificationMenuClick = true;
    this.topbarNotificationMenuActive = !this.topbarNotificationMenuActive;

    this.hideOverlayMenu();

    event.preventDefault();
  }

  onRightMenuClick(event) {
    this.rightMenuClick = true;
    this.rightPanelMenuActive = !this.rightPanelMenuActive;

    this.hideOverlayMenu();

    event.preventDefault();
  }

  onProfileClick(event) {
    this.profileClick = true;
    this.inlineUserMenuActive = !this.inlineUserMenuActive;
  }

  onTopbarSubItemClick(event) {
    event.preventDefault();
  }

  onConfigClick(event) {
    this.configClick = true;
  }

  isHorizontal() {
    return this.menuMode === 'horizontal';
  }

  isSlim() {
    return this.menuMode === 'slim';
  }

  isOverlay() {
    return this.menuMode === 'overlay';
  }

  isStatic() {
    return this.menuMode === 'static';
  }

  isMobile() {
    return window.innerWidth < 1025;
  }

  isDesktop() {
    return window.innerWidth > 896;
  }

  isTablet() {
    const width = window.innerWidth;
    return width <= 1024 && width > 640;
  }

  hideOverlayMenu() {
    this.overlayMenuActive = false;
    this.staticMenuMobileActive = false;
  }

  changeMenuMode(menuMode: string) {
    this.menuMode = menuMode;
    this.staticMenuDesktopInactive = false;
    this.overlayMenuActive = false;
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
        'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }
}
