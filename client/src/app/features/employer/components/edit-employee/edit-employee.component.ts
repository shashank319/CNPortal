import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CandidateService } from '../../../../shared/services/candidate.service';
import { Candidate, CandidateStatus } from '../../../../core/models/candidate.model';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule,
    MatCardModule,
    MatSnackBarModule
  ],
  providers: [CandidateService],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.css'
})
export class EditEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  candidateId: string | null = null;
  candidate: Candidate | null = null;
  isLoading = false;

  statusOptions = [
    { value: CandidateStatus.ACTIVE, label: 'Active' },
    { value: CandidateStatus.INACTIVE, label: 'Inactive' },
    { value: CandidateStatus.INTERVIEWED, label: 'Interviewed' },
    { value: CandidateStatus.HIRED, label: 'Hired' },
    { value: CandidateStatus.REJECTED, label: 'Rejected' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private candidateService: CandidateService,
    private snackBar: MatSnackBar
  ) {
    this.employeeForm = this.initializeForm();
  }

  ngOnInit(): void {
    this.candidateId = this.route.snapshot.paramMap.get('id');
    if (this.candidateId) {
      this.loadCandidate();
    } else {
      this.router.navigate(['/employer/candidates']);
    }
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      clientName: ['', [Validators.required]],
      hourlyRate: ['', [Validators.required, Validators.min(15), Validators.max(500)]],
      status: ['', [Validators.required]],
      skills: ['']
    });
  }

  private loadCandidate(): void {
    if (!this.candidateId) return;

    this.isLoading = true;
    this.candidateService.getCandidate(Number(this.candidateId)).subscribe({
      next: (candidate) => {
        this.candidate = candidate;
        this.populateForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading candidate:', error);
        this.snackBar.open('Candidate not found', 'Close', { duration: 3000 });
        this.router.navigate(['/employer/candidates']);
        this.isLoading = false;
      }
    });
  }

  private populateForm(): void {
    if (this.candidate) {
      this.employeeForm.patchValue({
        firstName: this.candidate.firstName,
        lastName: this.candidate.lastName,
        phoneNumber: this.candidate.phoneNumber,
        email: this.candidate.email,
        clientName: this.candidate.clientName,
        hourlyRate: this.candidate.hourlyRate,
        status: this.candidate.status,
        skills: this.candidate.skills || ''
      });
    }
  }

  onSave(): void {
    if (this.employeeForm.valid && this.candidateId) {
      this.isLoading = true;

      const formData = this.employeeForm.value;
      const updatedCandidate: Partial<Candidate> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        clientName: formData.clientName,
        hourlyRate: parseFloat(formData.hourlyRate),
        status: formData.status,
        skills: formData.skills || ''
      };

      // In a real application, this would call a service method to update the candidate
      console.log('Updated candidate:', updatedCandidate);

      this.snackBar.open('Employee updated successfully!', 'Close', {
        duration: 3000
      });

      this.isLoading = false;
      this.router.navigate(['/employer/candidates']);
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
        duration: 3000
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employer/candidates']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.employeeForm.controls).forEach(key => {
      const control = this.employeeForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.employeeForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors?.['minlength']?.requiredLength} characters`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    if (control?.hasError('min')) {
      return `Hourly rate must be at least $${control.errors?.['min']?.min}`;
    }
    if (control?.hasError('max')) {
      return `Hourly rate cannot exceed $${control.errors?.['max']?.max}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      phoneNumber: 'Phone number',
      email: 'Email',
      clientName: 'Vendor company',
      hourlyRate: 'Hourly rate',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  }
}