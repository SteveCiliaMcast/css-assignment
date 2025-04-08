import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Check if the JWT token is present in localStorage
    const token = localStorage.getItem('jwtToken');
    
    if (token) {
      // If the token exists, allow the navigation
      return true;
    } else {
      // If no token, redirect to the login page
      this.router.navigate(['/login']);
      return false;
    }
  }
}
