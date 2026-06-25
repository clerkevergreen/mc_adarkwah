import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Quote {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate?: string;
  guestCount?: number;
  message: string;
  status: 'pending' | 'contacted' | 'closed';
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: { page: number; limit: number; total: number; pages: number };
  message?: string;
}

const mapId = (item: any): any => {
  if (!item) return item;
  const { _id, __v, ...rest } = item;
  return { id: _id, ...rest };
};

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getQuotes(params?: Record<string, any>): Observable<Quote[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
    }
    const qs = searchParams.toString();
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/quotes${qs ? '?' + qs : ''}`)
      .pipe(map(res => (res.data || []).map(e => mapId(e) as Quote)));
  }

  updateStatus(id: string, status: string): Observable<Quote> {
    return this.http
      .patch<ApiResponse<any>>(`${this.apiUrl}/quotes/${id}/status`, { status })
      .pipe(map(res => mapId(res.data) as Quote));
  }

  deleteQuote(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/quotes/${id}`)
      .pipe(map(res => undefined));
  }
}
