import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Testimonial } from '../../../app/models/event.model';

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
export class TestimonialsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createTestimonial(data: Partial<Testimonial>): Observable<Testimonial> {
    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}/testimonials`, data)
      .pipe(map(res => mapId(res.data) as Testimonial));
  }

  getTestimonials(params?: Record<string, any>): Observable<Testimonial[]> {
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
      .get<ApiResponse<any[]>>(`${this.apiUrl}/testimonials${qs ? '?' + qs : ''}`)
      .pipe(map(res => (res.data || []).map(e => mapId(e) as Testimonial)));
  }

  updateTestimonial(id: string, data: Partial<Testimonial>): Observable<Testimonial> {
    return this.http
      .put<ApiResponse<any>>(`${this.apiUrl}/testimonials/${id}`, data)
      .pipe(map(res => mapId(res.data) as Testimonial));
  }

  approveTestimonial(id: string): Observable<Testimonial> {
    return this.http
      .patch<ApiResponse<any>>(`${this.apiUrl}/testimonials/${id}/approve`, {})
      .pipe(map(res => mapId(res.data) as Testimonial));
  }

  deleteTestimonial(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/testimonials/${id}`)
      .pipe(map(res => undefined));
  }
}
