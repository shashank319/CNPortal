import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '';
  activeTab: 'employer' | 'employee' = 'employer';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  switchTab(tab: 'employer' | 'employee'): void {
    this.activeTab = tab;
    // Auto-fill demo credentials based on selected tab
    if (tab === 'employer') {
      this.loginForm.patchValue({
        email: 'employer1@company.com',
        password: 'Test@123'
      });
    } else {
      this.loginForm.patchValue({
        email: 'employee1@company.com',
        password: 'Test@123'
      });
    }
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['employer1@company.com', [Validators.required, Validators.email]],
      password: ['Test@123', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response.requirePasswordChange) {
            // Handle first-time login password change
            this.snackBar.open('Please change your password on first login', 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            // Redirect to password change component (to be implemented)
            return;
          }

          // Get current user to determine redirect
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            // Redirect based on user role
            if (currentUser.role === 'Admin' || currentUser.role === 'Manager') {
              this.router.navigate([this.returnUrl || '/employer/dashboard']);
            } else if (currentUser.role === 'Emp') {
              this.router.navigate([this.returnUrl || '/employee/dashboard']);
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.message || 'Login failed. Please try again.', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  socialLogin(provider: 'microsoft' | 'google'): void {
    // Mock social login for demo
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      console.log(`${provider} login would be implemented here`);
    }, 1000);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${fieldName === 'email' ? 'Email' : 'Password'} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return 'Password must be at least 6 characters long';
      }
    }
    return '';
  }
}