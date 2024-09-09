import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageUtilService } from '../../shared/services/message-util.service';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  public email: any;

  constructor(private router: Router,
              private messageService: MessageUtilService,
              private apiService: ApiService) {
  }

  ngOnInit() {
  }

  async send() {
    const result = await this.apiService.checkEmail(this.email);
    if (result === 'OK') {
      this.messageService.showSuccess('E-mail send ' + this.email);
      this.router.navigateByUrl('/login');
    } else {
      this.messageService.showError('E-mail address is incorrect');
    }
  }
}
