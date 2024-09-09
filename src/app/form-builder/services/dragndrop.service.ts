import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { isNgContainer } from '@angular/compiler';
import { FormFieldType } from 'src/app/shared/models/entities/form-field-type';
import { BusyService } from '../../shared/services/busy.service';

@Injectable()
export class DragndropService {

  public dragStart: Subject<FormFieldType>;
  public dragEnd: Subject<boolean>;

  constructor(private busyService: BusyService) {
    this.dragStart = new Subject<FormFieldType>();
    this.dragEnd = new Subject<boolean>();
  }

  listen() {
    return this.dragStart;
  }

  dragStartName(name) {
    this.dragStart.next(name);
  }

  dragStarted(fieldType: FormFieldType) {
    this.dragStart.next(fieldType);
  }

  dragEnded() {
    this.dragEnd.next(true);
  }
}
