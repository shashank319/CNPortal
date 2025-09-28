import { Component, OnInit, OnDestroy } from '@angular/core';
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
    if (!this.timesheetForm) return 0;
    const hoursArray = this.timesheetForm.get('hours') as FormArray;
    if (!hoursArray) return 0;
    return hoursArray.controls.reduce((total, control) => total + (parseFloat(control.value) || 0), 0);
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Ensure only employees can access this component
    if (!this.authService.isEmployee()) {
      this.snackBar.open('Access denied: This feature is only available for employees', 'Close', { duration: 5000 });
      return;
    }

    this.initializeForm();
    this.generateInitialCalendar();
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

    // Watch for period changes
    this.timesheetForm.get('periodType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.generateInitialCalendar();
      });

    this.timesheetForm.get('year')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.generateInitialCalendar();
      });

    this.timesheetForm.get('month')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.generateInitialCalendar();
      });
  }

  private generateInitialCalendar(): void {
    const formValue = this.timesheetForm?.value;
    if (!formValue?.periodType || !formValue?.year || !formValue?.month) {
      console.log('Missing form values for calendar generation:', formValue);
      return;
    }

    console.log('Generating calendar for:', formValue);

    // Generate calendar days based on period type
    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { startDate, endDate } = this.calculatePeriodDates(
      formValue.periodType,
      formValue.year,
      formValue.month
    );

    console.log('Period dates:', { startDate, endDate, periodType: formValue.periodType });

    // Generate calendar days
    const currentDate = new Date(startDate);
    let dayCount = 0;
    while (currentDate <= endDate && dayCount < 50) { // Safety limit
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
    this.updateHoursFormArray();
  }

  private calculatePeriodDates(periodType: TimesheetPeriodType, year: number, month: number): { startDate: Date, endDate: Date } {
    switch (periodType) {
      case TimesheetPeriodType.Weekly:
        // First week of the selected month (Monday to Sunday)
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const startOfWeek = new Date(firstDayOfMonth);
        const dayOfWeek = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Monday start
        startOfWeek.setDate(diff);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return { startDate: startOfWeek, endDate: endOfWeek };

      case TimesheetPeriodType.BiWeekly:
        // First two weeks of the selected month (14 days starting from first Monday)
        const firstDayOfMonth2 = new Date(year, month - 1, 1);
        const startOfBiWeek = new Date(firstDayOfMonth2);
        const dayOfWeek2 = startOfBiWeek.getDay();
        const diff2 = startOfBiWeek.getDate() - dayOfWeek2 + (dayOfWeek2 === 0 ? -6 : 1);
        startOfBiWeek.setDate(diff2);
        startOfBiWeek.setHours(0, 0, 0, 0);

        const endOfBiWeek = new Date(startOfBiWeek);
        endOfBiWeek.setDate(startOfBiWeek.getDate() + 13); // 14 days total
        endOfBiWeek.setHours(23, 59, 59, 999);

        return { startDate: startOfBiWeek, endDate: endOfBiWeek };

      case TimesheetPeriodType.Monthly:
        // Full month
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0); // Last day of month

        return { startDate: startOfMonth, endDate: endOfMonth };

      default:
        return { startDate: new Date(), endDate: new Date() };
    }
  }

  private updateHoursFormArray(): void {
    const hoursArray = this.timesheetForm.get('hours') as FormArray;
    hoursArray.clear();

    console.log(`Creating ${this.calendarDays.length} form controls`);
    this.calendarDays.forEach((day, index) => {
      hoursArray.push(this.fb.control(0, [Validators.min(0), Validators.max(24)]));
      console.log(`Added control ${index} for ${day.date.toDateString()}`);
    });
    console.log(`Form array now has ${hoursArray.length} controls`);
  }

  getHoursControl(index: number): FormControl {
    const hoursArray = this.timesheetForm.get('hours') as FormArray;
    return hoursArray.at(index) as FormControl;
  }

  onHoursChange(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const hours = parseFloat(target.value) || 0;

    if (hours >= 0 && hours <= 24) {
      const hoursArray = this.timesheetForm.get('hours') as FormArray;
      hoursArray.at(index).setValue(hours);
      this.calendarDays[index].hours = hours;
    }
  }

  autoFill8Hours(): void {
    const hoursArray = this.timesheetForm.get('hours') as FormArray;

    this.calendarDays.forEach((day, index) => {
      if (!day.isWeekend) { // Only fill weekdays
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

    const currentWeekNumber = this.calculateCurrentWeekNumber(formValue.year, formValue.month);

    return {
      employeeID: this.employeeID,
      periodType: formValue.periodType,
      year: formValue.year,
      month: formValue.month,
      weekNumber: currentWeekNumber,
      dailyHours: dailyHours,
      isDraft: isDraft
    };
  }

  private calculateCurrentWeekNumber(year: number, month: number): number {
    const currentDate = new Date();

    // If it's not the current month/year, default to week 1
    if (year !== currentDate.getFullYear() || month !== (currentDate.getMonth() + 1)) {
      return 1;
    }

    // Calculate which week of the month we're in
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const currentDayOfMonth = currentDate.getDate();

    // Find the first Monday of the month
    const firstMonday = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    firstMonday.setDate(firstDayOfMonth.getDate() + daysToAdd);

    // If current date is before first Monday, it's week 1
    if (currentDate < firstMonday) {
      return 1;
    }

    // Calculate week number based on days since first Monday
    const daysSinceFirstMonday = Math.floor((currentDate.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(daysSinceFirstMonday / 7) + 1;
  }

  getHoursInputClass(day: TimesheetCalendarDay, index: number): string {
    const control = (this.timesheetForm.get('hours') as FormArray).at(index);
    const hasValue = day.hours > 0;
    const hasError = control.invalid && control.touched;

    let classes = 'hours-input';

    if (hasValue) classes += ' filled';
    if (day.isWeekend) classes += ' weekend';
    if (hasError) classes += ' error';
    if (day.isToday) classes += ' today';

    return classes;
  }

  getDayClass(day: TimesheetCalendarDay): string {
    let classes = 'calendar-day';

    if (day.isWeekend) classes += ' weekend';
    if (!day.isCurrentMonth) classes += ' other-month';
    if (day.isToday) classes += ' today';
    if (day.hours > 0) classes += ' has-hours';

    return classes;
  }

  getMonthlyWeeks(): TimesheetCalendarDay[][] {
    if (!this.calendarDays.length) return [];

    const weeks: TimesheetCalendarDay[][] = [];
    const startDate = this.calendarDays[0].date;

    // Get first day of month and adjust to start from Sunday
    const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const startOfWeek = new Date(firstDay);
    startOfWeek.setDate(firstDay.getDate() - firstDay.getDay());

    // Generate 6 weeks to cover the entire month view
    for (let week = 0; week < 6; week++) {
      const weekDays: TimesheetCalendarDay[] = [];

      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + (week * 7) + day);

        const isCurrentMonth = currentDate.getMonth() === startDate.getMonth();
        const calendarDay = this.calendarDays.find(cd =>
          cd.date.toDateString() === currentDate.toDateString()
        );

        if (calendarDay) {
          weekDays.push(calendarDay);
        } else {
          // Add placeholder for dates outside current timesheet period
          weekDays.push({
            date: currentDate,
            dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNumber: currentDate.getDate(),
            hours: 0,
            isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
            isCurrentMonth: isCurrentMonth,
            isToday: false
          });
        }
      }

      weeks.push(weekDays);
    }

    return weeks;
  }

  getBiWeeklyWeeks(): TimesheetCalendarDay[][] {
    console.log(`getBiWeeklyWeeks called, calendarDays length: ${this.calendarDays.length}`);
    if (!this.calendarDays.length) return [];

    const weeks: TimesheetCalendarDay[][] = [];
    const week1 = this.calendarDays.slice(0, 7);
    const week2 = this.calendarDays.slice(7, 14);

    console.log(`Week 1 has ${week1.length} days, Week 2 has ${week2.length} days`);

    if (week1.length > 0) weeks.push(week1);
    if (week2.length > 0) weeks.push(week2);

    console.log(`Returning ${weeks.length} weeks for bi-weekly view`);
    return weeks;
  }

  getDayIndex(day: TimesheetCalendarDay): number {
    const index = this.calendarDays.findIndex(cd =>
      cd.date.toDateString() === day.date.toDateString()
    );
    return index >= 0 ? index : -1;
  }

  getStatusLabel(status: TimesheetStatus): string {
    return STATUS_LABELS[status] || 'Unknown';
  }
}