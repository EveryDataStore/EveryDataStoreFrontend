import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BusyService {
  // tslint:disable-next-line: variable-name
  private _isBusy = false;
  private count = 0;

  show(caller?) {
    this.count++;

    setTimeout(_ => {
      this._isBusy = true;
    });
  }

  hide() {
    this.count--;

    if (this.count <= 0) {
      setTimeout(_ => {
        this._isBusy = false;
      });
    }
  }

  get isBusy(): boolean {
    return this._isBusy;
  }
}
