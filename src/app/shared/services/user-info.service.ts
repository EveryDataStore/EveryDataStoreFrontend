import { Settings } from './../models/entities/settings';
import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  constructor( @Inject(LOCAL_STORAGE) private storageService: StorageService) { }

  public setUserInfo(user) {
    user = JSON.stringify(user);
    this.storageService.set('user', user);
  }

  public getUserInfo() {
    const userDataAsString = this.storageService.get('user');
    if (userDataAsString === undefined) {
      return null;
    }
    const userInfo = JSON.parse(userDataAsString);
    return userInfo;
  }

  public updateSettings(settings: Settings) {
    const userInfo = this.getUserInfo();
    userInfo.Settings = settings;
    this.setUserInfo(userInfo);
  }
}
