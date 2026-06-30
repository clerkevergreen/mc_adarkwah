import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  error = '';
  success = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      this.router.navigate(['/admin/login']);
    }
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

    const token = localStorage.getItem('admin_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post<any>(`${environment.apiUrl}/auth/register`, {
      name: this.name,
      email: this.email,
      password: this.password,
    }, { headers }).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.name = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          localStorage.removeItem('admin_token');
          this.router.navigate(['/admin/login']);
        } else {
          this.error = err.error?.message || 'Signup failed. Please try again.';
        }
      },
    });
  }
}
