import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, RegisterRequest, EmployeeDetails } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'cnportal_token';
  private readonly USER_KEY = 'cnportal_user';

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      switchMap(response => {
        if (response.token) {
          // Store the token
          localStorage.setItem(this.TOKEN_KEY, response.token);

          // Fetch employee details to create full user object
          return this.getEmployeeDetails(response.employeeId).pipe(
            map(employeeDetails => {
              const user: User = this.mapEmployeeToUser(employeeDetails);
              this.setUserData(user);
              return response;
            })
          );
        } else {
          return of(response);
        }
      }),
      catchError(error => {
        return throwError(() => error.error || error);
      })
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    // Registration would be implemented here
    // For now, return an error as registration isn't implemented in backend
    return throwError(() => new Error('Registration not implemented'));
  }

  logout(): void {
    this.clearAuthData();
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  private getEmployeeDetails(employeeId: number): Observable<EmployeeDetails> {
    return this.http.get<EmployeeDetails>(`${this.apiUrl}/employees/${employeeId}`);
  }

  private mapEmployeeToUser(employeeDetails: EmployeeDetails): User {
    return {
      id: employeeDetails.employeeID.toString(),
      employeeId: employeeDetails.employeeID,
      email: employeeDetails.email,
      fullName: `${employeeDetails.firstName} ${employeeDetails.lastName}`,
      role: employeeDetails.identity.role as 'Emp' | 'Admin' | 'Manager' | 'Client',
      vendor: employeeDetails.vendor?.vendorName,
      isActive: employeeDetails.status === 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private setUserData(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  refreshToken(): Observable<string> {
    // Refresh token logic would be implemented here for production
    // For now, just return an error as refresh tokens aren't implemented in backend
    return throwError(() => new Error('Refresh token not implemented'));
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}