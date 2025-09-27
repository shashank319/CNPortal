import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <h2>My Profile</h2>
      <p>Employee profile management feature is coming soon...</p>
    </div>
  `,
  styles: []
})
export class ProfileComponent {
}