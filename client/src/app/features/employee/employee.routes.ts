import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/employee-layout/employee-layout.component').then(c => c.EmployeeLayoutComponent),
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
        path: 'upload-timesheet',
        loadComponent: () => import('./components/upload-timesheet/upload-timesheet.component').then(c => c.UploadTimesheetComponent)
      },
      {
        path: 'timesheet-entry',
        loadComponent: () => import('./components/timesheet-entry/timesheet-entry.component').then(c => c.TimesheetEntryComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(c => c.ProfileComponent)
      }
    ]
  }
];