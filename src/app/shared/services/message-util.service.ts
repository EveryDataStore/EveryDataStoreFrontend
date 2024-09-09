import { Injectable } from '@angular/core';
import { Message, MessageService } from 'primeng/api';

@Injectable()
export class MessageUtilService {
  constructor(private messageService: MessageService) { }

  private life = 4000;

  public showStickyError(msg: string) {
    this.messageService.add({ key: 'SysErrorToast', severity: 'error', detail: msg, sticky: true });
  }

  public showError(msg: string) {
    this.messageService.add({ severity: 'error', detail: msg, sticky: false, key: 'error', life: 5000 });
  }

  public showWarning(msg: string) {
    // for now we want to show warnings in green (success), e.g. 'you are in demo mode....' message
    this.messageService.add({ severity: 'success', detail: msg, sticky: false, key: 'error', life: 5000 });   
  }

  public showErrors(msgs: string[]) {
    msgs.forEach(msg => {
      this.messageService.add({ severity: 'error', detail: msg, key: 'error' });
    });
  }

  public showSuccess(msg: string) {
    this.messageService.add({ severity: 'success', detail: msg, life: this.life });
  }

  public showInfo(msg: string) {
    this.messageService.add({ severity: 'info', detail: msg, life: this.life });
  }

  public show(msg: string, severity?: string) {
    const sev = typeof severity === 'undefined' ? 'error' : severity;
    this.messageService.add({ severity: sev, detail: msg, life: this.life });
  }

  public showMessage(msg: Message) {
    this.messageService.add(msg);
  }

  public clear(key: string) {
    this.messageService.clear(key);
  }
}
