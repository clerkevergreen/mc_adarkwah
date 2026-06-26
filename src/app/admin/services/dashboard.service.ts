import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalTestimonials: number;
  approvedTestimonials: number;
  totalSubscribers: number;
  totalContacts: number;
  eventsByCategory: { _id: string; count: number }[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getStats(): Observable<DashboardStats> {
    return this.http
      .get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard`)
      .pipe(map(res => res.data));
  }
}
