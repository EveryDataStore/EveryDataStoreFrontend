import { MenuType } from './../models/entities/menu';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private menuSource = new Subject<string>();
  private resetSource = new Subject();
  private reloadSource = new Subject<MenuType>();

  reloadSource$ = this.reloadSource.asObservable(); 
  menuSource$ = this.menuSource.asObservable();
  resetSource$ = this.resetSource.asObservable();

  onMenuStateChange(key: string) {
      this.menuSource.next(key);
  }

  reloadMenu(menuType: MenuType) {
    this.reloadSource.next(menuType);
  }

  reset() {
      this.resetSource.next();
  }

  constructor() { }

}
