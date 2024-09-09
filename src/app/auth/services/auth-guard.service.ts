import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService  {

  constructor(private router: Router, private authService: AuthService) { }

  canActivate(route: import('@angular/router').ActivatedRouteSnapshot,
              state: import('@angular/router').RouterStateSnapshot): Observable<boolean> {
      const tokenFromQueryParam = route.queryParamMap.get('apitoken');

      if (this.authService.isLoggedIn(tokenFromQueryParam)) {
        return of(true);
      }
      this.authService.logout();
  }
}
