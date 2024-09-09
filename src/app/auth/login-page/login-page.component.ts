import { RoutingService } from 'src/app/shared/services/routing.service';
import { BusyService } from 'src/app/shared/services/busy.service';
import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  username: string;
  password: string;
  showFailedLoginMessage: boolean;

  constructor(private authService: AuthService,
              private router: Router,
              private busyService: BusyService,
              private routingService: RoutingService) { }

  ngOnInit() {
  }

  async login() {
    this.busyService.show();
    const result = await this.authService.login(this.username, this.password);
    if (result) {
      await this.routingService.toDashboard();
    } else {
      this.clearForm();
      this.showFailedLoginMessage = true;
    }
    this.busyService.hide();
  }

  keydown(event: KeyboardEvent) {
    if (event.key === '13') {
      this.login();
    }
  }

  private clearForm() {
    this.username = '';
    this.password = '';
  }


}
