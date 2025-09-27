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

interface TimesheetData {
  id: string;
  candidateName: string;
  email: string;
  month: string;
  hoursLogged: number | null;
  status: 'submitted' | 'pending' | 'approved';
  submittedDate: Date | null;
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
    submitted: 12,
    pending: 3,
    totalHours: 1240,
    activeCandidates: 15
  };

  selectedMonth = '2024-12';
  selectedStatus = '';

  pageSize = 5;
  pageIndex = 0;
  totalItems = 0;

  private mockData: TimesheetData[] = [
    {
      id: '1',
      candidateName: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      month: 'December 2024',
      hoursLogged: 168,
      status: 'submitted',
      submittedDate: new Date('2024-12-28')
    },
    {
      id: '2',
      candidateName: 'Michael Chen',
      email: 'michael.chen@email.com',
      month: 'December 2024',
      hoursLogged: null,
      status: 'pending',
      submittedDate: null
    },
    {
      id: '3',
      candidateName: 'Emily Davis',
      email: 'emily.davis@email.com',
      month: 'December 2024',
      hoursLogged: 152,
      status: 'submitted',
      submittedDate: new Date('2024-12-30')
    },
    {
      id: '4',
      candidateName: 'David Wilson',
      email: 'david.wilson@email.com',
      month: 'December 2024',
      hoursLogged: null,
      status: 'pending',
      submittedDate: null
    },
    {
      id: '5',
      candidateName: 'Lisa Thompson',
      email: 'lisa.thompson@email.com',
      month: 'December 2024',
      hoursLogged: 176,
      status: 'submitted',
      submittedDate: new Date('2024-12-29')
    }
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.dataSource.data = this.mockData;
    this.totalItems = this.mockData.length;
  }

  onFilterChange(): void {
    let filteredData = [...this.mockData];

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
}