import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Event } from '../../../app/models/event.model';

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

const mapDates = (item: any): any => {
  if (!item) return item;
  const result = { ...item };
  if (result.date) result.date = new Date(result.date);
  if (result.endDate) result.endDate = new Date(result.endDate);
  return result;
};

const transformEvent = (e: any): Event => {
  const mapped = mapId(mapDates(e));
  if (mapped.videos) mapped.videos = mapped.videos.map((v: any) => mapId(v));
  if (mapped.sponsors) mapped.sponsors = mapped.sponsors.map((s: any) => mapId(s));
  if (mapped.testimonials) mapped.testimonials = mapped.testimonials.map((t: any) => mapId(t));
  return mapped as Event;
};

@Injectable({ providedIn: 'root' })
export class EventsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getEvents(params?: Record<string, any>): Observable<Event[]> {
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
      .get<ApiResponse<any[]>>(`${this.apiUrl}/events${qs ? '?' + qs : ''}`)
      .pipe(map(res => (res.data || []).map(transformEvent)));
  }

  getEventBySlug(slug: string): Observable<Event | null> {
    return this.http
      .get<ApiResponse<any>>(`${this.apiUrl}/events/${slug}`)
      .pipe(map(res => (res.data ? transformEvent(res.data) : null)));
  }

  createEvent(data: Partial<Event>): Observable<Event> {
    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}/events`, data)
      .pipe(map(res => transformEvent(res.data)));
  }

  updateEvent(id: string, data: Partial<Event>): Observable<Event> {
    return this.http
      .put<ApiResponse<any>>(`${this.apiUrl}/events/${id}`, data)
      .pipe(map(res => transformEvent(res.data)));
  }

  deleteEvent(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/events/${id}`)
      .pipe(map(res => undefined));
  }

  toggleFeature(id: string): Observable<Event> {
    return this.http
      .patch<ApiResponse<any>>(`${this.apiUrl}/events/${id}/toggle-feature`, {})
      .pipe(map(res => transformEvent(res.data)));
  }

  uploadImage(file: File): Observable<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http
      .post<ApiResponse<{ url: string; filename: string }>>(`${this.apiUrl}/upload`, formData)
      .pipe(map(res => res.data));
  }
}
