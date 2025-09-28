import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CandidateService } from '../../../../shared/services/candidate.service';

interface TimesheetData {
  id: string;
  candidateName: string;
  email: string;
  month: string;
  hoursLogged: number | null;
  status: 'submitted' | 'pending' | 'approved';
  submittedDate: Date | null;
  candidateId: number;
}

@Component({
  selector: 'app-timesheets',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './timesheets.component.html',
  styleUrl: './timesheets.component.css'
})
export class TimesheetsComponent implements OnInit {
  displayedColumns: string[] = ['candidateName', 'month', 'hoursLogged', 'status', 'submittedDate', 'actions'];
  dataSource = new MatTableDataSource<TimesheetData>([]);

  stats = {
    submitted: 0,
    pending: 0,
    totalHours: 0,
    activeCandidates: 0
  };

  selectedMonth = '2025-09';
  selectedStatus = '';

  pageSize = 5;
  pageIndex = 0;
  totalItems = 0;

  private timesheetData: TimesheetData[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private candidateService: CandidateService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.candidateService.getCandidates().subscribe({
      next: (response) => {
        this.timesheetData = response.items.map(candidate => {
          // Check if candidate was created recently (within last 7 days)
          const candidateCreatedAt = new Date(candidate.createdAt);
          const isNewCandidate = (Date.now() - candidateCreatedAt.getTime()) < (7 * 24 * 60 * 60 * 1000);

          // For simulation - existing candidates have random status, new ones are pending
          const status: 'submitted' | 'pending' | 'approved' = isNewCandidate
            ? 'pending'
            : (['submitted', 'pending', 'approved'][Math.floor(Math.random() * 3)] as 'submitted' | 'pending' | 'approved');

          const hasSubmitted = status === 'submitted' || status === 'approved';

          return {
            id: candidate.candidateId.toString(),
            candidateId: candidate.candidateId,
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            email: candidate.email,
            month: 'September 2025',
            hoursLogged: hasSubmitted ? Math.floor(Math.random() * 40) + 120 : null,
            status: status,
            submittedDate: hasSubmitted ? new Date(2025, 8, Math.floor(Math.random() * 25) + 1) : null
          };
        });

        this.updateStats();
        this.onFilterChange();
      },
      error: (error) => {
        console.error('Error fetching candidates:', error);
        this.snackBar.open('Error loading timesheet data', 'Close', { duration: 3000 });
        this.timesheetData = [];
        this.dataSource.data = [];
        this.totalItems = 0;
      }
    });
  }

  onFilterChange(): void {
    let filteredData = [...this.timesheetData];

    if (this.selectedStatus) {
      filteredData = filteredData.filter(item => item.status === this.selectedStatus);
    }

    this.dataSource.data = filteredData;
    this.totalItems = filteredData.length;
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'submitted': return 'check_circle';
      case 'pending': return 'schedule';
      case 'approved': return 'verified';
      default: return 'help';
    }
  }

  viewTimesheet(timesheet: TimesheetData): void {
    this.snackBar.open(`Viewing timesheet for ${timesheet.candidateName}`, 'Close', {
      duration: 2000
    });
  }

  downloadTimesheet(timesheet: TimesheetData): void {
    this.snackBar.open(`Downloading timesheet for ${timesheet.candidateName}`, 'Close', {
      duration: 2000
    });
  }

  sendReminder(timesheet: TimesheetData): void {
    this.snackBar.open(`Reminder sent to ${timesheet.candidateName}`, 'Close', {
      duration: 2000
    });
  }

  exportTimesheets(): void {
    this.snackBar.open('Exporting timesheets...', 'Close', {
      duration: 2000
    });
  }

  refreshData(): void {
    this.loadData();
    this.snackBar.open('Data refreshed', 'Close', {
      duration: 1000
    });
  }

  private updateStats(): void {
    const submitted = this.timesheetData.filter(t => t.status === 'submitted').length;
    const pending = this.timesheetData.filter(t => t.status === 'pending').length;
    const approved = this.timesheetData.filter(t => t.status === 'approved').length;
    const totalHours = this.timesheetData
      .filter(t => t.hoursLogged !== null)
      .reduce((sum, t) => sum + (t.hoursLogged || 0), 0);

    this.stats = {
      submitted: submitted + approved,
      pending: pending,
      totalHours: totalHours,
      activeCandidates: this.timesheetData.length
    };
  }
}