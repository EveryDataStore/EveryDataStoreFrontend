import { Injectable, EventEmitter, Output, Directive } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';

@Directive()
@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {


  @Output() invokeFirstComponentFunction = new EventEmitter<string>();
  subsVar: Subscription;

  constructor() {
  }

  onFirstComponentButtonClick(fieldName: string) {
    this.invokeFirstComponentFunction.emit(fieldName);
  }
}
