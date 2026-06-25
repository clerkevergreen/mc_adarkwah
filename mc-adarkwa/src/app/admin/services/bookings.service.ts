import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Booking {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  guestCount: number;
  budgetRange: string;
  additionalNotes: string;
  status: 'pending' | 'confirmed' | 'cancelled';
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
export class BookingsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createBooking(data: Partial<Booking>): Observable<Booking> {
    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}/bookings`, data)
      .pipe(map(res => mapId(res.data) as Booking));
  }

  getBookings(params?: Record<string, any>): Observable<Booking[]> {
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
      .get<ApiResponse<any[]>>(`${this.apiUrl}/bookings${qs ? '?' + qs : ''}`)
      .pipe(map(res => (res.data || []).map(e => mapId(e) as Booking)));
  }

  updateStatus(id: string, status: string): Observable<Booking> {
    return this.http
      .patch<ApiResponse<any>>(`${this.apiUrl}/bookings/${id}/status`, { status })
      .pipe(map(res => mapId(res.data) as Booking));
  }

  deleteBooking(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/bookings/${id}`)
      .pipe(map(res => undefined));
  }
}
