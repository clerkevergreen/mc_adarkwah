import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EventRegistration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  event: { _id: string; title: string; slug: string; date: string; venue: string };
  eventTitle: string;
  message: string;
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
export class RegistrationsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getRegistrations(params?: Record<string, any>): Observable<EventRegistration[]> {
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
      .get<ApiResponse<any[]>>(`${this.apiUrl}/registrations${qs ? '?' + qs : ''}`)
      .pipe(map(res => (res.data || []).map(e => { const r = mapId(e) as EventRegistration; r.eventTitle = r.event?.title || '-'; return r; })));
  }

  updateStatus(id: string, status: string): Observable<EventRegistration> {
    return this.http
      .patch<ApiResponse<any>>(`${this.apiUrl}/registrations/${id}/status`, { status })
      .pipe(map(res => mapId(res.data) as EventRegistration));
  }

  deleteRegistration(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/registrations/${id}`)
      .pipe(map(res => undefined));
  }
}
