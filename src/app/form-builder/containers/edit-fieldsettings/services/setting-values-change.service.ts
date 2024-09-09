import { FieldSetting } from 'src/app/shared/models/field-settings/field-setting';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingValuesChangeService {
  public changeSubject: Subject<FieldSetting>;

  constructor() {
      this.changeSubject = new Subject<FieldSetting>();
  }

  listen() {
      return this.changeSubject;
  }

  onChange(fieldSetting: FieldSetting) {
      this.changeSubject.next(fieldSetting);
  }
}
