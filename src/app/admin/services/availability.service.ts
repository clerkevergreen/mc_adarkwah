import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AvailabilityEntry {
  id: string;
  date: string;
  status: 'available' | 'blocked' | 'booked';
  reason?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

const mapEntry = (item: any): AvailabilityEntry => {
  const { _id, __v, ...rest } = item;
  return { id: _id, ...rest };
};

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAvailability(startDate?: string, endDate?: string): Observable<AvailabilityEntry[]> {
    let params = '';
    if (startDate) params += `?startDate=${startDate}`;
    if (endDate) params += `${params ? '&' : '?'}endDate=${endDate}`;
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/availability${params}`)
      .pipe(map(res => (res.data || []).map(e => mapEntry(e))));
  }

  getBlocks(): Observable<AvailabilityEntry[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/availability/admin`)
      .pipe(map(res => (res.data || []).map(e => mapEntry(e))));
  }

  blockDates(dates: string[], reason?: string): Observable<AvailabilityEntry[]> {
    return this.http
      .post<ApiResponse<any[]>>(`${this.apiUrl}/availability/block`, { dates, reason })
      .pipe(map(res => (res.data || []).map(e => mapEntry(e))));
  }

  unblockDate(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/availability/${id}`)
      .pipe(map(() => undefined));
  }

  syncBookings(): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.apiUrl}/availability/sync`, {})
      .pipe(map(() => undefined));
  }
}
