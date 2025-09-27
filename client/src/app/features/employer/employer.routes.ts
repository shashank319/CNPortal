import { Routes } from '@angular/router';

export const EMPLOYER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/employer-layout/employer-layout.component').then(c => c.EmployerLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'candidates',
        loadComponent: () => import('./components/candidates/candidates.component').then(c => c.CandidatesComponent)
      },
      {
        path: 'timesheets',
        loadComponent: () => import('./components/timesheets/timesheets.component').then(c => c.TimesheetsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(c => c.ProfileComponent)
      },
      {
        path: 'add-employee',
        loadComponent: () => import('./components/add-employee/add-employee.component').then(c => c.AddEmployeeComponent)
      },
      {
        path: 'edit-employee/:id',
        loadComponent: () => import('./components/edit-employee/edit-employee.component').then(c => c.EditEmployeeComponent)
      }
    ]
  }
];