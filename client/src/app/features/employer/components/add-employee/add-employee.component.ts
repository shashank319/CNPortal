import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CandidateService } from '../../../../shared/services/candidate.service';
import { CreateCandidateRequest } from '../../../../core/models/candidate.model';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.css'
})
export class AddEmployeeComponent implements OnInit {
  employeeForm!: FormGroup;
  isLoading = false;

  vendorCompanies = [
    'TechCorp Inc.',
    'DataSoft LLC',
    'InnovateTech',
    'GlobalSystems',
    'CodeCrafters',
    'DevSolutions',
    'SmartTech Solutions',
    'Innovative Software Group'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private candidateService: CandidateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      vendorCompany: ['', [Validators.required]],
      hourlyRate: ['', [Validators.required, Validators.min(15), Validators.max(500)]],
      skills: [''],
      experience: [0, [Validators.min(0)]],
      notes: ['']
    });
  }

  onSave(): void {
    if (this.employeeForm.valid) {
      this.isLoading = true;

      const formData = this.employeeForm.value;

      // Create candidate request object
      const candidateRequest: CreateCandidateRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        clientName: formData.vendorCompany,
        skills: formData.skills || '',
        experience: formData.experience || 0,
        notes: formData.notes || '',
        hourlyRate: formData.hourlyRate
      };

      this.candidateService.createCandidate(candidateRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Candidate added successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          // Navigate back to candidates list
          this.router.navigate(['/employer/candidates']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error creating candidate:', error);
          this.snackBar.open('Error adding candidate. Please try again.', 'Close', {
            duration: 3000
          });
        }
      });
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000
      });
    }
  }

  onCancel(): void {
    // Navigate back to dashboard
    this.router.navigate(['/employer/dashboard']);
  }

  getFieldError(fieldName: string): string {
    const field = this.employeeForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid phone number';
      }
      if (field.errors['min']) {
        return `Hourly rate must be at least $${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Hourly rate must be less than $${field.errors['max'].max}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      phoneNumber: 'Phone Number',
      email: 'Email',
      vendorCompany: 'Vendor Company',
      hourlyRate: 'Hourly Rate'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.employeeForm.controls).forEach(key => {
      const control = this.employeeForm.get(key);
      control?.markAsTouched();
    });
  }
}