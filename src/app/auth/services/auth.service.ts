import { CookieService } from 'ngx-cookie';
import { ApiService } from './../../shared/services/api.service';
import { Injectable } from '@angular/core';
import { RoutingService } from 'src/app/shared/services/routing.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn = false;

  constructor(private apiService: ApiService,
              private routingService: RoutingService,
              private cookieService: CookieService) {
    if (this.apiService.getToken()) {
      this.loggedIn = true;
    }
  }

  public async login(username: string, password: string): Promise<boolean> {
    const result = await this.apiService.login(username, password);
    this.loggedIn = result;
    if (result) {
      this.cookieService.put('token', this.apiService.getToken());
    }
    return result;
  }

  public async logout() {
    this.apiService.logout();
    this.cookieService.remove('token');

    this.loggedIn = false;
    await this.routingService.toLoginPage();
  }

  public isLoggedIn(apiTokenFromQueryParam: string = null): boolean {
    if (apiTokenFromQueryParam && apiTokenFromQueryParam.length >= 60) {
      this.cookieService.put('token', apiTokenFromQueryParam);
      this.loggedIn = true;
    }
    return this.loggedIn;
  }
}