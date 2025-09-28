import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TimesheetEntryRequest,
  TimesheetEntryResponse,
  TimesheetPeriodInfo,
  TimesheetPeriodType,
  AutoFillRequest,
  DailyHours
} from '../models/timesheet.models';

@Injectable({
  providedIn: 'root'
})
export class TimesheetEntryService {
  private readonly apiUrl = `${environment.apiUrl}/timesheetentry`;

  constructor(private http: HttpClient) {}

  getPeriodInfo(
    periodType: TimesheetPeriodType,
    year: number,
    month: number,
    weekNumber?: number
  ): Observable<TimesheetPeriodInfo> {
    let params = new HttpParams()
      .set('periodType', periodType.toString())
      .set('year', year.toString())
      .set('month', month.toString());

    if (weekNumber) {
      params = params.set('weekNumber', weekNumber.toString());
    }

    return this.http.get<TimesheetPeriodInfo>(`${this.apiUrl}/period-info`, { params });
  }

  getDraftTimesheet(
    periodType: TimesheetPeriodType,
    year: number,
    month: number,
    weekNumber?: number
  ): Observable<TimesheetEntryResponse | null> {
    let params = new HttpParams()
      .set('periodType', periodType.toString())
      .set('year', year.toString())
      .set('month', month.toString());

    if (weekNumber) {
      params = params.set('weekNumber', weekNumber.toString());
    }

    return this.http.get<TimesheetEntryResponse | null>(`${this.apiUrl}/draft`, { params });
  }

  autoFillHours(request: AutoFillRequest): Observable<DailyHours[]> {
    return this.http.post<DailyHours[]>(`${this.apiUrl}/auto-fill`, request);
  }

  saveDraft(request: TimesheetEntryRequest): Observable<TimesheetEntryResponse> {
    return this.http.post<TimesheetEntryResponse>(`${this.apiUrl}/save-draft`, request);
  }

  submitTimesheet(request: TimesheetEntryRequest): Observable<TimesheetEntryResponse> {
    return this.http.post<TimesheetEntryResponse>(`${this.apiUrl}/submit`, request);
  }

  getSubmittedTimesheets(year?: number, month?: number): Observable<TimesheetEntryResponse[]> {
    let params = new HttpParams();

    if (year) {
      params = params.set('year', year.toString());
    }

    if (month) {
      params = params.set('month', month.toString());
    }

    return this.http.get<TimesheetEntryResponse[]>(`${this.apiUrl}/submitted`, { params });
  }

  deleteDraft(
    periodType: TimesheetPeriodType,
    year: number,
    month: number,
    weekNumber?: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('periodType', periodType.toString())
      .set('year', year.toString())
      .set('month', month.toString());

    if (weekNumber) {
      params = params.set('weekNumber', weekNumber.toString());
    }

    return this.http.delete(`${this.apiUrl}/draft`, { params });
  }
}