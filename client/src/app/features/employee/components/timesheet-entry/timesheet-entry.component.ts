// timesheet-entry.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';

import { TimesheetEntryService } from '../../../../shared/services/timesheet-entry.service';
import { AuthService } from '../../../../shared/services/auth.service';
import {
  TimesheetPeriodType,
  TimesheetCalendarDay,
  TimesheetPeriodInfo,
  TimesheetEntryRequest,
  TimesheetEntryResponse,
  PERIOD_TYPE_LABELS,
  STATUS_LABELS,
  TimesheetStatus,
  AutoFillRequest,
  DailyHours
} from '../../../../shared/models/timesheet.models';

@Component({
  selector: 'app-timesheet-entry',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './timesheet-entry.component.html',
  styleUrl: './timesheet-entry.component.css'
})
export class TimesheetEntryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  timesheetForm!: FormGroup;
  currentTimesheet?: TimesheetEntryResponse;
  periodInfo?: TimesheetPeriodInfo;
  calendarDays: TimesheetCalendarDay[] = [];

  isLoading = false;
  isSaving = false;

  readonly periodTypes = [
    { value: TimesheetPeriodType.Weekly, label: PERIOD_TYPE_LABELS[TimesheetPeriodType.Weekly] },
    { value: TimesheetPeriodType.BiWeekly, label: PERIOD_TYPE_LABELS[TimesheetPeriodType.BiWeekly] },
    { value: TimesheetPeriodType.Monthly, label: PERIOD_TYPE_LABELS[TimesheetPeriodType.Monthly] }
  ];

  readonly months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  readonly years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - 2 + i
  ).map(year => ({ value: year, label: year.toString() }));

  get totalHours(): number {
    if (!this.calendarDays) return 0;
    return this.calendarDays.reduce((total, day) => total + (day.hours || 0), 0);
  }

  get selectedEmployee(): string {
    return this.authService.getFullName();
  }

  get employeeID(): number {
    return this.authService.getUserId();
  }

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetEntryService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.isEmployee()) {
      this.snackBar.open('Access denied: This feature is only available for employees', 'Close', { duration: 5000 });
      return;
    }

    this.initializeForm();
    this.generateCalendar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const currentDate = new Date();

    this.timesheetForm = this.fb.group({
      periodType: [TimesheetPeriodType.Weekly, Validators.required],
      year: [currentDate.getFullYear(), Validators.required],
      month: [currentDate.getMonth() + 1, Validators.required],
      hours: this.fb.array([])
    });

    // Watch for period changes with debounce to avoid multiple calls
    this.timesheetForm.get('periodType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Clear existing data before regenerating
        this.calendarDays = [];
        setTimeout(() => this.generateCalendar(), 0);
      });

    this.timesheetForm.get('year')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        setTimeout(() => this.generateCalendar(), 0);
      });

    this.timesheetForm.get('month')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        setTimeout(() => this.generateCalendar(), 0);
      });
  }

  private generateCalendar(): void {
    const formValue = this.timesheetForm?.value;
    if (!formValue?.periodType || !formValue?.year || !formValue?.month) {
      console.log('Missing form values, skipping calendar generation');
      return;
    }

    console.log('Generating calendar for period type:', formValue.periodType);

    // Clear existing calendar days
    this.calendarDays = [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { startDate, endDate } = this.calculatePeriodDates(
      formValue.periodType,
      formValue.year,
      formValue.month
    );

    console.log('Date range:', { 
      periodType: formValue.periodType,
      startDate: startDate.toDateString(), 
      endDate: endDate.toDateString(),
      expectedDays: formValue.periodType === 1 ? 7 : formValue.periodType === 2 ? 14 : 'variable'
    });

    // Generate calendar days based on period
    const currentDate = new Date(startDate);
    let dayCount = 0;
    
    while (currentDate <= endDate) {
      this.calendarDays.push({
        date: new Date(currentDate),
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: currentDate.getDate(),
        hours: 0,
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
        isCurrentMonth: currentDate.getMonth() === formValue.month - 1,
        isToday: currentDate.getTime() === today.getTime()
      });
      currentDate.setDate(currentDate.getDate() + 1);
      dayCount++;
    }

    console.log(`Generated ${this.calendarDays.length} calendar days`);
    
    // Force update the hours form array
    this.updateHoursFormArray();
    
    // Force change detection
    this.cdr.detectChanges();
  }

  private calculatePeriodDates(periodType: TimesheetPeriodType, year: number, month: number): 
    { startDate: Date, endDate: Date } {
    
    switch (periodType) {
      case TimesheetPeriodType.Weekly:
        // Get the current week (Monday to Sunday)
        const today = new Date();
        const currentDate = today.getDate();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        
        // If viewing current month/year, show current week
        // Otherwise show first week of selected month
        let baseDate: Date;
        if (year === currentYear && month === currentMonth) {
          baseDate = today;
        } else {
          baseDate = new Date(year, month - 1, 1);
        }
        
        const startOfWeek = new Date(baseDate);
        const dayOfWeek = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return { startDate: startOfWeek, endDate: endOfWeek };

      case TimesheetPeriodType.BiWeekly:
        // Get current two weeks or first two weeks of month
        const today2 = new Date();
        const currentDate2 = today2.getDate();
        const currentMonth2 = today2.getMonth() + 1;
        const currentYear2 = today2.getFullYear();
        
        let baseDate2: Date;
        if (year === currentYear2 && month === currentMonth2) {
          baseDate2 = today2;
        } else {
          baseDate2 = new Date(year, month - 1, 1);
        }
        
        const startOfBiWeek = new Date(baseDate2);
        const dayOfWeek2 = startOfBiWeek.getDay();
        const diff2 = startOfBiWeek.getDate() - dayOfWeek2 + (dayOfWeek2 === 0 ? -6 : 1);
        startOfBiWeek.setDate(diff2);
        
        const endOfBiWeek = new Date(startOfBiWeek);
        endOfBiWeek.setDate(startOfBiWeek.getDate() + 13); // 14 days total
        
        return { startDate: startOfBiWeek, endDate: endOfBiWeek };

      case TimesheetPeriodType.Monthly:
        // Full month
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);
        
        return { startDate: startOfMonth, endDate: endOfMonth };

      default:
        const defaultStart = new Date(year, month - 1, 1);
        const defaultEnd = new Date(year, month - 1, 1);
        return { startDate: defaultStart, endDate: defaultEnd };
    }
  }

  private updateHoursFormArray(): void {
    const hoursArray = this.timesheetForm.get('hours') as FormArray;
    
    // Clear all existing controls
    while (hoursArray.length !== 0) {
      hoursArray.removeAt(0);
    }

    // Add new controls for each calendar day
    this.calendarDays.forEach((day, index) => {
      const control = this.fb.control(day.hours || 0, [Validators.min(0), Validators.max(24)]);
      hoursArray.push(control);
      console.log(`Added control ${index} for ${day.date.toDateString()}`);
    });
    
    console.log(`Hours array now has ${hoursArray.length} controls for ${this.calendarDays.length} days`);
  }

  getHoursControl(index: number): FormControl {
    const hoursArray = this.timesheetForm.get('hours') as FormArray;
    return hoursArray.at(index) as FormControl;
  }

  onHoursChange(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const hours = parseFloat(target.value) || 0;

    if (hours >= 0 && hours <= 24 && index >= 0 && index < this.calendarDays.length) {
      const hoursArray = this.timesheetForm.get('hours') as FormArray;
      hoursArray.at(index).setValue(hours);
      this.calendarDays[index].hours = hours;
    }
  }

  autoFill8Hours(): void {
    const hoursArray = this.timesheetForm.get('hours') as FormArray;

    this.calendarDays.forEach((day, index) => {
      if (!day.isWeekend) {
        hoursArray.at(index).setValue(8);
        day.hours = 8;
      }
    });

    this.snackBar.open('Auto-filled 8 hours for weekdays', 'Close', { duration: 2000 });
  }

  clearAll(): void {
    const hoursArray = this.timesheetForm.get('hours') as FormArray;

    this.calendarDays.forEach((day, index) => {
      hoursArray.at(index).setValue(0);
      day.hours = 0;
    });

    this.snackBar.open('All hours cleared', 'Close', { duration: 2000 });
  }

  saveDraft(): void {
    if (this.timesheetForm.invalid) {
      this.snackBar.open('Please fix form errors before saving', 'Close', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const request = this.buildTimesheetRequest(true);

    this.timesheetService.saveDraft(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.currentTimesheet = response;
          this.snackBar.open('Draft saved successfully', 'Close', { duration: 3000 });
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error saving draft:', error);
          this.snackBar.open('Error saving draft', 'Close', { duration: 3000 });
          this.isSaving = false;
        }
      });
  }

  submitTimesheet(): void {
    if (this.timesheetForm.invalid || this.totalHours === 0) {
      this.snackBar.open('Please enter valid hours before submitting', 'Close', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const request = this.buildTimesheetRequest(false);

    this.timesheetService.submitTimesheet(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.currentTimesheet = response;
          this.snackBar.open('Timesheet submitted successfully', 'Close', { duration: 3000 });
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error submitting timesheet:', error);
          this.snackBar.open('Error submitting timesheet', 'Close', { duration: 3000 });
          this.isSaving = false;
        }
      });
  }

  private buildTimesheetRequest(isDraft: boolean): TimesheetEntryRequest {
    const formValue = this.timesheetForm.value;
    const hoursArray = this.timesheetForm.get('hours') as FormArray;

    const dailyHours: DailyHours[] = this.calendarDays.map((day, index) => ({
      date: day.date,
      hours: hoursArray.at(index).value || 0,
      isWeekend: day.isWeekend,
      isHoliday: false
    }));

    return {
      employeeID: this.employeeID,
      periodType: formValue.periodType,
      year: formValue.year,
      month: formValue.month,
      weekNumber: this.calculateCurrentWeekNumber(formValue.year, formValue.month),
      dailyHours: dailyHours,
      isDraft: isDraft
    };
  }

  private calculateCurrentWeekNumber(year: number, month: number): number {
    const currentDate = new Date();
    if (year !== currentDate.getFullYear() || month !== (currentDate.getMonth() + 1)) {
      return 1;
    }

    const firstDayOfMonth = new Date(year, month - 1, 1);
    const currentDayOfMonth = currentDate.getDate();
    const firstMonday = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    firstMonday.setDate(firstDayOfMonth.getDate() + daysToAdd);

    if (currentDate < firstMonday) {
      return 1;
    }

    const daysSinceFirstMonday = Math.floor((currentDate.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(daysSinceFirstMonday / 7) + 1;
  }

  getDayIndex(day: TimesheetCalendarDay): number {
    const index = this.calendarDays.findIndex(cd =>
      cd.date.toDateString() === day.date.toDateString()
    );
    return index;
  }

  getMonthlyDaysWithPadding(): (TimesheetCalendarDay | null)[] {
    if (!this.calendarDays.length) return [];
    
    const result: (TimesheetCalendarDay | null)[] = [];
    const firstDay = this.calendarDays[0];
    const startPadding = firstDay.date.getDay();
    
    // Add padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      result.push(null);
    }
    
    // Add all calendar days
    result.push(...this.calendarDays);
    
    // Add padding to complete the grid (6 rows * 7 days = 42)
    while (result.length < 42) {
      result.push(null);
    }
    
    return result;
  }

  getStatusLabel(status: TimesheetStatus): string {
    return STATUS_LABELS[status] || 'Unknown';
  }

  // Track by functions for better change detection
  trackByDate(index: number, day: TimesheetCalendarDay): string {
    return day.date.toISOString();
  }

  trackByMonthDay(index: number, day: TimesheetCalendarDay | null): string {
    return day ? day.date.toISOString() : `empty-${index}`;
  }
}