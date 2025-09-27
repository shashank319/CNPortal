import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Check role-based access if specified in route data
    const requiredRole = route.data['role'];
    if (requiredRole && !this.authService.hasRole(requiredRole)) {
      // Redirect to appropriate dashboard based on user role
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.role === 'employer') {
        this.router.navigate(['/employer/dashboard']);
      } else if (currentUser?.role === 'employee') {
        this.router.navigate(['/employee/dashboard']);
      } else {
        this.router.navigate(['/auth/login']);
      }
      return false;
    }

    return true;
  }
}