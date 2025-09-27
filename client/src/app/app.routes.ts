import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES)
  },
  {
    path: 'employer',
    loadChildren: () => import('./features/employer/employer.routes').then(r => r.EMPLOYER_ROUTES),
    canActivate: [AuthGuard],
    data: { role: 'employer' }
  },
  {
    path: 'employee',
    loadChildren: () => import('./features/employee/employee.routes').then(r => r.EMPLOYEE_ROUTES),
    canActivate: [AuthGuard],
    data: { role: 'employee' }
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
