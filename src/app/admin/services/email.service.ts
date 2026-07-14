import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmailLog {
  _id: string;
  to: string;
  subject: string;
  type: string;
  status: 'sent' | 'failed';
  error?: string;
  messageId?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: any;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getLogs(params?: Record<string, any>): Observable<EmailLog[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) searchParams.set(k, String(v));
      });
    }
    const qs = searchParams.toString();
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/email/logs${qs ? '?' + qs : ''}`)
      .pipe(map(res => res.data || []));
  }

  getStats(): Observable<{ sent: number; failed: number; total: number }> {
    return this.http
      .get<ApiResponse<{ sent: number; failed: number; total: number }>>(`${this.apiUrl}/email/stats`)
      .pipe(map(res => res.data || { sent: 0, failed: 0, total: 0 }));
  }

  sendTest(to: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/email/test`, { to });
  }
}
