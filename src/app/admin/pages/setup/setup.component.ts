import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent implements OnInit {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  canSetup = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/auth/setup`).subscribe({
      error: (err) => {
        if (err.status === 400) {
          this.canSetup = false;
          this.router.navigate(['/admin/login']);
        }
      },
    });
  }

  onSubmit(): void {
    if (!this.name || !this.email || !this.password) {
      this.error = 'All fields are required';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';

    this.http.post<any>(`${environment.apiUrl}/auth/setup`, {
      name: this.name,
      email: this.email,
      password: this.password,
    }).subscribe({
      next: (res) => {
        if (res.success && res.data.token) {
          localStorage.setItem('admin_token', res.data.token);
          localStorage.setItem('admin_name', res.data.admin.name);
          localStorage.setItem('admin_email', res.data.admin.email);
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Setup failed. Please try again.';
      },
    });
  }
}
