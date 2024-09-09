import { environment } from './../../../environments/environment';
import { LanguageService } from './language.service';
import { UserInfoService } from './user-info.service';
import { TokenResult } from '../models/entities/token-result';
import { Settings } from '../models/entities/settings';
import { CrmDiscountDef, CrmItemDef, CrmPositionItemDef, CrmRecordAndFields, CrmTaxRateDef } from 'src/app/plugins/crm/crm-plugin/crm-settings';
import { Injectable } from '@angular/core';
import { CrmDefaultCurrency } from 'src/app/plugins/crm/crm-plugin/crm-settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  static readonly DEFAULT_THEME = 'blue';

  public settings: Settings = null;


  constructor(private userInfoService: UserInfoService, private languageService: LanguageService) {
  }

  public initialize() {
    const user: TokenResult = (this.userInfoService.getUserInfo()) as unknown as TokenResult;
    if ((user !== null) && (user.Settings !== undefined)) {
      this.set(user.Settings);
    }
  }

  public set(settings: Settings) {
    this.settings = settings;

    const locale = this.getSettings().Locale;
    if (locale) {
      this.languageService.setLanguageFromLocale(locale);
    }

    let themeColor = this.getSettings().ThemeColor;
    if (themeColor === 'default') {
      themeColor = SettingsService.DEFAULT_THEME;
    }
    if (themeColor && themeColor !== 'null') {
        this.changeTheme(themeColor);
    }
  }

  public getSettings(): Settings {
    if ((this.settings === null) || (this.settings === undefined)) {
      this.initialize();
    }
    return this.settings;
  }

  public get(name = null, defaultValue = null): any {
    if (this.settings) {
      if (this.settings[name]) {
        return this.settings[name];
      }
    }
    return defaultValue;
  }

  public isActiveApp(Slug: string): boolean {
    if (this.getSettings().Apps) {
      for (let i = 0; i < this.getSettings().Apps.length; i++) {
          if (this.getSettings().Apps[i].Active === 1 && this.getSettings().Apps[i].Slug === Slug) {
              return true;
          }
      }
    }
    return false;
  }

  public isInDemoMode() {
    if (environment.demoMode) {
      return true;
    }
    return this.get('DemoMode', 0) === 1;
  }

  public getFromName(name: string) {
    return this.getSettings()[name];
  }

  public getAsJson(name: string) {
    return this.toJson(this.getFromName(name));
  }

  public getItemsPerPage(): number {
    return this.getSettings().ItemsPerPage;
  }

  public getMaxTotalResults(): number {
    return this.getSettings().MaxTotalResults;
  }

  public getDateFormat(): string {
    return this.getSettings().DateFormat;
  }

  public getDateTimeFormat(): string {
    return this.getSettings().DateTimeFormat;
  }

  public getTimeFormat(): string {
    return this.getSettings().TimeFormat;
  }

  public getPasswordMaxLength(): number {
    return this.getSettings().PasswordMaxLength;
  }

  public getPasswordMinLength(): number {
    return this.getSettings().PasswordMinLength;
  }

  public getLocale(): string {
    return this.getSettings().Locale ? this.settings.Locale.replace('_', '-') : 'en-US';
  }

  public getUploadAllowedFileSize(): number{
    return this.getSettings().UploadAllowedFileSize ? this.settings.UploadAllowedFileSize : 100000;
  }

  public getUploadAllowedFileNumber(): number{
    return this.getSettings().UploadAllowedFileNumber ? this.settings.UploadAllowedFileNumber : 1;
  }

  public getUploadAllowedExtensions(): any{
    return this.getSettings().UploadAllowedExtensions ? this.settings.UploadAllowedExtensions : null;
  }

  public getCrmRecordsAndFields(): CrmRecordAndFields[] {
    return this.toJson(this.getSettings().crm_records_and_fields, 'crm_records_and_fields');
  }

  public getCrmServiceItemDef(): CrmPositionItemDef {
    return this.toJson(this.getSettings().crm_service_item, 'crm_service_item');
  }

  public getCrmProductItemDef(): CrmPositionItemDef {
    return this.toJson(this.getSettings().crm_product_item, 'crm_product_item');
  }

  public getCrmDocumentSelectorFields(): [] {
    return this.toJson(this.getSettings().crm_document_selector_fields, 'crm_document_selector_fields');
  }

  public getCrmDefaultCurrency(): CrmDefaultCurrency {
    return this.toJson(this.getSettings().crm_default_currency, 'crm_default_currency');
  }

  public getCrmProductDef(): CrmItemDef {
    return this.toJson(this.getSettings().crm_product);
  }  

  public getCrmServiceDef(): CrmItemDef {
    return this.toJson(this.getSettings().crm_service);
  }

  public getCrmTaxRateDef(): CrmTaxRateDef {
    return this.toJson(this.getSettings().crm_tax_rate, 'crm_tax_rate');
  }    
  
  public getDiscountDef(): CrmDiscountDef {
    return this.toJson(this.getSettings().crm_discount, 'crm_discount');
  }

  public getDataStoreName(): string {
    return this.getSettings().CurrentDataStoreName;
  }

  public getMemberEmail(): string {
    return this.getSettings().Email;
  }

  public getDataStoreFolderSlug(): string {
    return this.getSettings().CurrentDataStoreFolderSlug;
  }

  public getMenuBadgeUpdateInterval(): number {

    return this.getSettings().MenuBadgeUpdateInterval ? this.getSettings().MenuBadgeUpdateInterval : 100000;
  }

  public getProductRecordSlugs(): any {
    return this.settings.product_record_slugs ? this.toJson(this.settings.product_record_slugs): [];
  }

  private toJson(jsonString: string, name = '') {
    let result: any;
    try {
      result = JSON.parse(jsonString);
    } catch (error) {
      console.log('Error in parsing ' + name + ': "' + jsonString + '" to json: ' + error);
      result = {};
    }
    return result;
  }

  private changeTheme(theme: string) {
    if (!theme) {
      return;
    }
    this.changeStyleSheetsColor('layout-css', 'layout-' + theme + '.css');
    this.changeStyleSheetsColor('theme-css', 'theme-' + theme + '.css');
  }

  private changeStyleSheetsColor(id, value) {
      const element = document.getElementById(id);
      const urlTokens = element.getAttribute('href').split('/');
      urlTokens[urlTokens.length - 1] = value;

      const newURL = urlTokens.join('/');

      this.replaceLink(element, newURL);
  }

  private replaceLink(linkElement, href) {
    if (this.isIE()) {
        linkElement.setAttribute('href', href);
    }
    else {
        const id = linkElement.getAttribute('id');
        const cloneLinkElement = linkElement.cloneNode(true);

        cloneLinkElement.setAttribute('href', href);
        cloneLinkElement.setAttribute('id', id + '-clone');

        linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

        cloneLinkElement.addEventListener('load', () => {
            linkElement.remove();
            cloneLinkElement.setAttribute('id', id);
        });
    }
  }

  private isIE() {
    return /(MSIE|Trident\/|Edge\/)/i.test(window.navigator.userAgent);
  }
}

