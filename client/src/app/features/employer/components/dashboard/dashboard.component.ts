import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CandidateService } from '../../../../shared/services/candidate.service';
import { CommonModule, DatePipe, DecimalPipe, NgIf, TitleCasePipe } from '@angular/common';
import { TimesheetSummary } from '../../../../core/models/timesheet.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import {MatSelectModule} from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import {MatChipsModule} from '@angular/material/chips';

@Component({
  selector: 'app-dashboard',
  standalone: true,
 imports: [
    NgIf,
    MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatListModule,
    MatDividerModule, MatMenuModule, MatBadgeModule, MatSelectModule, DecimalPipe, MatTableModule, MatChipsModule, TitleCasePipe, DatePipe,
    MatPaginatorModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  public selectedMonth: string = '';
  public selectedStatus: string = '';
  recentTimesheets: any[] = [];
  candidates: any[] = [];
  pageSize = 5;
  pageIndex = 0;
  pagedTimesheets: any[] = [];

  constructor(
    private candidateService: CandidateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.candidateService.getCandidates().subscribe({
      next: (response) => {
        this.candidates = response.items;
        this.recentTimesheets = this.candidates.map(c => {
          // Check if candidate was created recently (within last 7 days)
          const candidateCreatedAt = new Date(c.createdAt);
          const isNewCandidate = (Date.now() - candidateCreatedAt.getTime()) < (7 * 24 * 60 * 60 * 1000);

          return {
            candidateName: `${c.firstName} ${c.lastName}`,
            email: c.email,
            month: 'September 2025',
            totalHours: isNewCandidate ? 0 : Math.floor(Math.random() * 40) + 80,
            status: isNewCandidate ? 'pending' : ['approved', 'pending', 'rejected'][Math.floor(Math.random() * 3)],
            weekEnding: new Date(2025, 8, 25 - (Math.floor(Math.random() * 4))),
          };
        });
      },
      error: (error) => {
        console.error('Error fetching candidates:', error);
        this.candidates = [];
        this.recentTimesheets = [];
      }
    });
    this.updatePagedTimesheets();
  }

  updatePagedTimesheets() {
    const start = this.pageIndex * this.pageSize;
    this.pagedTimesheets = this.recentTimesheets.slice(start, start + this.pageSize);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.updatePagedTimesheets();
  }

  timesheetSummary: TimesheetSummary = {
    totalSubmitted: 12,
    totalPending: 3,
    totalApproved: 9,
    totalRejected: 1,
    totalHours: 1240,
    activeCandidates: 15,
    totalCandidates: 42,
    activeProjects: 7,
    thisMonthHours: 160,
    pendingReviews: 5
  };


  quickStats = [
    {
      title: 'Total Candidates',
      value: '24',
      change: '+3',
      changeType: 'increase',
      icon: 'fas fa-users',
      color: 'primary'
    },
    {
      title: 'Active Projects',
      value: '8',
      change: '+1',
      changeType: 'increase',
      icon: 'fas fa-project-diagram',
      color: 'info'
    },
    {
      title: 'This Month Hours',
      value: '1,856',
      change: '+12%',
      changeType: 'increase',
      icon: 'fas fa-clock',
      color: 'success'
    },
    {
      title: 'Pending Reviews',
      value: '3',
      change: '-2',
      changeType: 'decrease',
      icon: 'fas fa-exclamation-circle',
      color: 'warning'
    }
  ];


  getTimeDifference(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  // Navigation methods
  goToCandidates(): void {
    this.router.navigate(['/employer/candidates']);
  }

  goToTimesheets(): void {
    this.router.navigate(['/employer/timesheets']);
  }

  goToProfile(): void {
    this.router.navigate(['/employer/profile']);
  }

  addNewCandidate(): void {
    this.router.navigate(['/employer/add-employee']);
  }

  exportData(): void {
    // Implement export functionality
    console.log('Export functionality would be implemented here');
  }

  refreshData(): void {
    // Refresh dashboard data
    this.ngOnInit();
  }
}