import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserData();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['John Smith', [Validators.required]],
      email: ['john.smith@company.com', [Validators.required, Validators.email]],
      phoneNumber: ['+1 (555) 123-4567'],
      vendor: ['TechCorp Inc.'],
      employeeId: ['EMP-2024-001'],
      clientManager: ['Sarah Johnson'],
      department: ['Software Development'],
      startDate: [new Date('2024-01-15')],
      streetAddress: ['123 Main Street, Apt 4B'],
      city: ['New York'],
      state: ['New York'],
      zipCode: ['10001'],
      country: ['United States']
    });
  }

  private loadUserData(): void {
    // In a real app, this would load data from a service
    // For now, the form is initialized with mock data
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;

      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }, 1500);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.profileForm.reset();
    this.loadUserData();
    this.snackBar.open('Changes cancelled', 'Close', {
      duration: 2000
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }
}