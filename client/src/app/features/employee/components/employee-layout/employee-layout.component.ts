import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../../../shared/services/auth.service';

// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './employee-layout.component.html',
  styleUrl: './employee-layout.component.css'
})
export class EmployeeLayoutComponent implements OnInit {
  currentUser: User | null = null;
  sidebarCollapsed = false;

  menuItems = [
    {
      icon: 'dashboard',
      label: 'Dashboard',
      route: '/employee/dashboard'
    },
    {
      icon: 'schedule',
      label: 'Timesheet Entry',
      route: '/employee/timesheet-entry'
    },
    {
      icon: 'upload_file',
      label: 'Submit Timesheet',
      route: '/employee/upload-timesheet'
    },
    {
      icon: 'person',
      label: 'My Profile',
      route: '/employee/profile'
    }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getFullName(): string {
    return this.authService.getFullName();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

}