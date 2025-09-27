import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-employer-layout',
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
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './employer-layout.component.html',
  styleUrl: './employer-layout.component.css'
})
export class EmployerLayoutComponent implements OnInit {
  currentUser: User | null = null;
  sidebarCollapsed = false;

  menuItems = [
    {
      icon: 'dashboard',
      label: 'Dashboard',
      route: '/employer/dashboard',
      active: true
    },
    {
      icon: 'people',
      label: 'Candidates Management',
      route: '/employer/candidates',
      active: false
    },
    {
      icon: 'schedule',
      label: 'Timesheets Management',
      route: '/employer/timesheets',
      active: false
    },
    {
      icon: 'person',
      label: 'My Profile',
      route: '/employer/profile',
      active: false
    }
  ];

  constructor(
    private authService: AuthService,
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

  setActiveMenuItem(route: string): void {
    this.menuItems.forEach(item => {
      item.active = item.route === route;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateTo(route: string): void {
    this.setActiveMenuItem(route);
    this.router.navigate([route]);
  }
}