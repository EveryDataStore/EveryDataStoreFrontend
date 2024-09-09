import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class AsyncConfirmationService {

  constructor(
    private confirmationService: ConfirmationService,
    private translateService: TranslateService) { }

  confirmYesNo(header: string, message: string, asyncFunct: () => Promise<void>): Promise<boolean> {

    return new Promise(async resolve => {
      this.confirmationService.confirm({
        header: await this.translateService.get(header).toPromise(),
        message: await this.translateService.get(message).toPromise(),
        rejectVisible: true,
        acceptLabel: await this.translateService.get('yes').toPromise(),
        rejectLabel: await this.translateService.get('no').toPromise(),

        accept: async () => {
          await asyncFunct();
          resolve(true);
        },

        reject: () => {
          resolve(false);
        }
      });
    });
  }


  confirm(header: string, message: string): Promise<any> {
    return new Promise(async resolve => {
      this.confirmationService.confirm({
        header: await this.translateService.get(header).toPromise(),
        message: await this.translateService.get(message).toPromise(),
        acceptLabel: await this.translateService.get('ok').toPromise(),
        rejectVisible: false,

        accept: async () => {
          resolve(true);
        }
      });
    });
  }
}
