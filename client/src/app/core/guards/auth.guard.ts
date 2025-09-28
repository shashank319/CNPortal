import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  // Updated for backend integration
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
    const requiredRoles = route.data['roles'];

    let hasAccess = true;
    if (requiredRole) {
      hasAccess = this.authService.hasRole(requiredRole);
    } else if (requiredRoles && Array.isArray(requiredRoles)) {
      const currentUser = this.authService.getCurrentUser();
      hasAccess = requiredRoles.includes(currentUser?.role);
    }

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on user role
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.role === 'Admin' || currentUser?.role === 'Manager') {
        this.router.navigate(['/employer/dashboard']);
      } else if (currentUser?.role === 'Emp') {
        this.router.navigate(['/employee/dashboard']);
      } else {
        this.router.navigate(['/auth/login']);
      }
      return false;
    }

    return true;
  }
}