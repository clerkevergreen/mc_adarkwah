import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = false;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
    if (!this.token) {
      this.error = 'Invalid reset link.';
    }
  }

  onSubmit(): void {
    if (!this.password || !this.confirmPassword) {
      this.error = 'Please enter and confirm your new password';
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

    this.http.post<any>(`${environment.apiUrl}/auth/reset-password`, {
      token: this.token,
      password: this.password,
    }).subscribe({
      next: (res) => {
        this.success = true;
        this.loading = false;
        if (res.data?.token) {
          localStorage.setItem('admin_token', res.data.token);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Reset failed. The link may have expired.';
      },
    });
  }
}
