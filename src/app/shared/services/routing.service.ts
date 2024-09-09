import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {

  constructor(private router: Router) { }

  readonly DASHBOARD_PATH = 'dashboard';

  public async toRecordItemView(recordItemSlug: string, queryParams = {}, version: number = 0) {
    if (version > 0){
        await this.goTo('/record/item/' + recordItemSlug + '/' + version, queryParams);
    } else {
       await this.goTo('/record/item/' + recordItemSlug, queryParams);
    }
  }

  public async toRecordItemEdit(recordItemSlug: string, queryParams = {}) {
    await this.goTo('/record/item/' + recordItemSlug + '/edit', queryParams);
  }

  public async toRecordItemsList(recordSlug: string, page = 1, queryParams = {}) {
    if (page > 1) {
      queryParams['page'] = page;
    }
    await this.goTo('/record/items/' + recordSlug, queryParams);
  }

  public async toAdminModelItemsList(modelName: string, queryParams = {}) {
    await this.goTo('/admin/' + modelName, queryParams);
  }

  public async toAdminModelNewItem(modelName: string, queryParams = {}) {
    await this.goTo('/admin/' + modelName + '/new-item/', queryParams);
  }

  public async toAdminModelItemEdit(modelName: string, modelItemSlug: string, queryParams = {}) {
    await this.goTo('/admin/' + modelName + '/edit/' + modelItemSlug, queryParams);
  }

  public async toRecordsList(queryParams = {}) {
    await this.goTo('/records', queryParams);
  }

  public async toNewRecord(queryParams = {}) {
    await this.goTo('/record/build', queryParams);
  }

  public async toRecordEdit(recordSlug: string, queryParams = {}, version: number = 0) {
    if (version > 0) {
       await this.goTo('/record/' + recordSlug + '/build/' + version, queryParams);
    }else{
        await this.goTo('/record/' + recordSlug + '/build', queryParams);
    }
  }

  public async toLoginPage() {
    await this.goTo('/login');
  }

  public async toDashboard() {
    await this.goTo(this.getDashboardPath());
  }

  public getDashboardPath() {
    return '/' + this.DASHBOARD_PATH;
  }

  private async goTo(url: string, queryParams = {}) {
    await this.router.navigate([url], {queryParams, skipLocationChange: false, replaceUrl: true});
  }
}
