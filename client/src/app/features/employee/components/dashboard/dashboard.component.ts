import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface TimesheetSummary {
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  pendingApprovals: number;
  approvedTimesheets: number;
}

interface RecentTimesheet {
  id: string;
  weekEnding: Date;
  totalHours: number;
  status: 'pending' | 'approved' | 'rejected';
  project: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

   selectedMonth: string = '2025-01';
     selectedStatus: string = '';
     
  timesheetSummary: TimesheetSummary = {
    totalHoursThisWeek: 32,
    totalHoursThisMonth: 156,
    pendingApprovals: 2,
    approvedTimesheets: 8
  };

  recentTimesheets: RecentTimesheet[] = [
    {
      id: 'TS001',
      weekEnding: new Date('2024-01-14'),
      totalHours: 40,
      status: 'approved',
      project: 'CNPortal Development'
    },
    {
      id: 'TS002',
      weekEnding: new Date('2024-01-21'),
      totalHours: 38,
      status: 'pending',
      project: 'CNPortal Development'
    },
    {
      id: 'TS003',
      weekEnding: new Date('2024-01-28'),
      totalHours: 42,
      status: 'pending',
      project: 'UI/UX Improvements'
    }
  ];

  ngOnInit(): void {
    // Load dashboard data
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning';
      case 'rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  trackById(_: number, t: RecentTimesheet) { return t.id; }

}