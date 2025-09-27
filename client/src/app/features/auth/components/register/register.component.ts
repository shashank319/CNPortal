import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid">
      <h2>Register</h2>
      <p>Registration feature is coming soon...</p>
      <a routerLink="/auth/login" class="btn btn-primary">Back to Login</a>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
}