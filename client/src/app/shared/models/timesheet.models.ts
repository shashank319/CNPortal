export enum TimesheetPeriodType {
  Weekly = 1,
  BiWeekly = 2,
  Monthly = 3
}

export enum TimesheetStatus {
  Draft = 1,
  Submitted = 2,
  ApprovedL1 = 3,
  ApprovedL2 = 4,
  Rejected = 5
}

export interface DailyHours {
  date: Date;
  hours: number;
  isWeekend: boolean;
  isHoliday: boolean;
}

export interface TimesheetEntryRequest {
  employeeID: number;
  periodType: TimesheetPeriodType;
  year: number;
  month: number;
  weekNumber?: number;
  dailyHours: DailyHours[];
  isDraft: boolean;
}

export interface TimesheetEntryResponse {
  timesheetID: number;
  employeeID: number;
  employeeName: string;
  periodType: TimesheetPeriodType;
  year: number;
  month: number;
  weekNumber?: number;
  startDate: Date;
  endDate: Date;
  totalHours: number;
  status: TimesheetStatus;
  createdDate: Date;
  submittedDate?: Date;
  dailyHours: DailyHours[];
  comments?: string;
}

export interface TimesheetPeriodInfo {
  periodType: TimesheetPeriodType;
  year: number;
  month: number;
  weekNumber?: number;
  startDate: Date;
  endDate: Date;
  workingDays: Date[];
  weekends: Date[];
}

export interface AutoFillRequest {
  periodType: TimesheetPeriodType;
  year: number;
  month: number;
  weekNumber?: number;
  hoursPerDay: number;
  weekdaysOnly: boolean;
}

export interface TimesheetCalendarDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  hours: number;
  isWeekend: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export const PERIOD_TYPE_LABELS = {
  [TimesheetPeriodType.Weekly]: 'Weekly',
  [TimesheetPeriodType.BiWeekly]: 'Bi-Weekly',
  [TimesheetPeriodType.Monthly]: 'Monthly'
};

export const STATUS_LABELS = {
  [TimesheetStatus.Draft]: 'Draft',
  [TimesheetStatus.Submitted]: 'Submitted',
  [TimesheetStatus.ApprovedL1]: 'Level 1 Approved',
  [TimesheetStatus.ApprovedL2]: 'Approved',
  [TimesheetStatus.Rejected]: 'Rejected'
};