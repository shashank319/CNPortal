import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'Employer' | 'Employee';
  companyName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // TODO: Initialize from localStorage or token
    // For now, simulate an employee user
    this.setCurrentUser({
      id: 1,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@company.com',
      role: 'Employee',
      companyName: 'TechCorp Inc.'
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  isEmployee(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'Employee';
  }

  isEmployer(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'Employer';
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'Admin';
  }

  getFullName(): string {
    const user = this.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  getUserId(): number {
    const user = this.getCurrentUser();
    return user?.id || 0;
  }

  logout(): void {
    this.setCurrentUser(null);
    // TODO: Clear localStorage, tokens, etc.
  }
}