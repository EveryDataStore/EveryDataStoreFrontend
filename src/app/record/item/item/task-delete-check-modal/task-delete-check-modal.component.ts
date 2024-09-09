import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-task-delete-check-modal',
  templateUrl: './task-delete-check-modal.component.html'
})
export class TaskDeleteCheckModalComponent implements OnInit {

  @Input()
  public visible: boolean;

  @Output()
  public onHideEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  public acceptEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }

  onHide() {
    this.onHideEvent.emit('');
  }

  dismiss() {
    this.onHide();
  }

  accept() {
    this.acceptEvent.emit('');
  }
}
