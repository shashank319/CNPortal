import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly TOKEN_KEY = 'cnportal_token';
  private readonly REFRESH_TOKEN_KEY = 'cnportal_refresh_token';
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
    // For demo purposes, using mock authentication
    return this.mockLogin(credentials).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    // For demo purposes, using mock registration
    return this.mockRegister(request).pipe(
      tap(response => {
        this.setAuthData(response);
      })
    );
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

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Mock refresh token logic
    return of('mock-new-token').pipe(
      tap(newToken => {
        localStorage.setItem(this.TOKEN_KEY, newToken);
      })
    );
  }

  private setAuthData(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Mock authentication methods for demo
  private mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        if (credentials.email === 'employer@test.com' && credentials.password === 'password') {
          const mockUser: User = {
            id: '1',
            email: 'employer@test.com',
            fullName: 'John Smith',
            role: 'employer',
            phoneNumber: '+1 (555) 123-4567',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const response: LoginResponse = {
            user: mockUser,
            token: 'mock-jwt-token-employer',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600
          };

          observer.next(response);
          observer.complete();
        } else if (credentials.email === 'employee@test.com' && credentials.password === 'password') {
          const mockUser: User = {
            id: '2',
            email: 'employee@test.com',
            fullName: 'Jane Doe',
            role: 'employee',
            phoneNumber: '+1 (555) 987-6543',
            employeeId: 'EMP-2024-001',
            vendor: 'TechCorp Inc.',
            clientManager: 'Sarah Johnson',
            department: 'Software Development',
            startDate: new Date('2024-01-15'),
            address: {
              street: '123 Main Street, Apt 4B',
              city: 'New York',
              state: 'New York',
              zipCode: '10001',
              country: 'United States'
            },
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const response: LoginResponse = {
            user: mockUser,
            token: 'mock-jwt-token-employee',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600
          };

          observer.next(response);
          observer.complete();
        } else {
          observer.error({ message: 'Invalid credentials' });
        }
      }, 1000);
    });
  }

  private mockRegister(request: RegisterRequest): Observable<LoginResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        const mockUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: request.email,
          fullName: request.fullName,
          role: request.role,
          phoneNumber: request.phoneNumber,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const response: LoginResponse = {
          user: mockUser,
          token: 'mock-jwt-token-new-user',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600
        };

        observer.next(response);
        observer.complete();
      }, 1000);
    });
  }
}