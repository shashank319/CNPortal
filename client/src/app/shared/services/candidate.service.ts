import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Candidate,
  CreateCandidateRequest,
  CreateCandidateResponse,
  UpdateCandidateRequest,
  CandidateListResponse
} from '../../core/models/candidate.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private readonly apiUrl = `${environment.apiUrl}/candidates`;

  constructor(private http: HttpClient) {}

  getCandidates(
    page: number = 1,
    pageSize: number = 20,
    email?: string,
    status?: string,
    clientName?: string
  ): Observable<CandidateListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (email) params = params.set('email', email);
    if (status) params = params.set('status', status);
    if (clientName) params = params.set('clientName', clientName);

    return this.http.get<CandidateListResponse>(this.apiUrl, { params }).pipe(
      map(response => ({
        ...response,
        items: response.items.map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }))
      })),
      catchError(error => {
        console.error('Error fetching candidates:', error);
        return throwError(() => error);
      })
    );
  }

  getCandidate(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`).pipe(
      map(candidate => ({
        ...candidate,
        createdAt: new Date(candidate.createdAt),
        updatedAt: new Date(candidate.updatedAt)
      })),
      catchError(error => {
        console.error('Error fetching candidate:', error);
        return throwError(() => error);
      })
    );
  }

  createCandidate(request: CreateCandidateRequest): Observable<CreateCandidateResponse> {
    return this.http.post<CreateCandidateResponse>(this.apiUrl, request).pipe(
      catchError(error => {
        console.error('Error creating candidate:', error);
        return throwError(() => error);
      })
    );
  }

  updateCandidate(id: number, request: UpdateCandidateRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request).pipe(
      catchError(error => {
        console.error('Error updating candidate:', error);
        return throwError(() => error);
      })
    );
  }

  deleteCandidate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting candidate:', error);
        return throwError(() => error);
      })
    );
  }
}
