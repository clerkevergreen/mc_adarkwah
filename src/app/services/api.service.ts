import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Event } from '../models/event.model';
import { GalleryItem } from '../models/gallery.model';
import { Service } from '../models/service.model';
import { Testimonial } from '../models/event.model';
import { FAQ } from '../models/faq.model';
import { NewsItem } from '../models/news.model';
import { BookingForm, QuoteForm } from '../models/service.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: { page: number; limit: number; total: number; pages: number };
  message?: string;
}

interface LoginResponse {
  success: boolean;
  data: { admin: any; token: string; refreshToken: string };
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
  if (result.createdAt) result.createdAt = new Date(result.createdAt);
  if (result.updatedAt) result.updatedAt = new Date(result.updatedAt);
  return result;
};

const transformEvent = (e: any): Event => {
  const mapped = mapId(mapDates(e));
  if (mapped.videos) mapped.videos = mapped.videos.map((v: any) => mapId(v));
  if (mapped.sponsors) mapped.sponsors = mapped.sponsors.map((s: any) => mapId(s));
  if (mapped.testimonials) mapped.testimonials = mapped.testimonials.map((t: any) => mapId(t));
  return mapped as Event;
};

const transformGalleryItem = (g: any): GalleryItem => {
  const mapped = mapId(mapDates(g));
  return mapped as GalleryItem;
};

const transformNewsItem = (n: any): NewsItem => {
  const mapped = mapId(n);
  if (mapped.createdAt) mapped.date = new Date(mapped.createdAt);
  delete mapped.createdAt;
  delete mapped.updatedAt;
  return mapped as NewsItem;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEvents(params?: { isUpcoming?: boolean; isFeatured?: boolean; page?: number; limit?: number }): Observable<Event[]> {
    const query = new URLSearchParams();
    if (params?.isUpcoming !== undefined) query.set('isUpcoming', String(params.isUpcoming));
    if (params?.isFeatured !== undefined) query.set('isFeatured', String(params.isFeatured));
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/events${qs ? '?' + qs : ''}`)
      .pipe(map(res => (res.data || []).map(transformEvent)));
  }

  getEventBySlug(slug: string): Observable<Event | null> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/events/${slug}`)
      .pipe(map(res => res.data ? transformEvent(res.data) : null));
  }

  getServices(): Observable<Service[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/services`)
      .pipe(map(res => (res.data || []).map(e => mapId(e) as Service)));
  }

  getGalleryItems(): Observable<GalleryItem[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/gallery`)
      .pipe(map(res => (res.data || []).map(transformGalleryItem)));
  }

  getTestimonials(): Observable<Testimonial[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/testimonials`)
      .pipe(map(res => (res.data || []).map(e => {
        const item = mapId(e);
        if (item.createdAt) delete item.createdAt;
        if (item.updatedAt) delete item.updatedAt;
        return item as Testimonial;
      })));
  }

  getFAQs(): Observable<FAQ[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/faqs`)
      .pipe(map(res => (res.data || []).map(e => mapId(e) as FAQ)));
  }

  getNews(): Observable<NewsItem[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/news`)
      .pipe(map(res => (res.data || []).map(transformNewsItem)));
  }

  getSponsors(): Observable<{ name: string; logo: string; website?: string }[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/sponsors`)
      .pipe(map(res => (res.data || []).map(e => mapId(e))));
  }

  submitBooking(data: BookingForm): Observable<{ success: boolean; message: string }> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/bookings`, data)
      .pipe(map(res => ({ success: res.success, message: res.message || 'Booking submitted' })));
  }

  submitQuote(data: QuoteForm): Observable<{ success: boolean; message: string }> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/quotes`, data)
      .pipe(map(res => ({ success: res.success, message: res.message || 'Quote request submitted' })));
  }

  submitContact(data: { name: string; email: string; subject: string; message: string }): Observable<{ success: boolean; message: string }> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/contact`, data)
      .pipe(map(res => ({ success: res.success, message: res.message || 'Message sent' })));
  }

  subscribeEmail(email: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/subscribers`, { email })
      .pipe(map(res => ({ success: res.success, message: res.message || 'Subscribed' })));
  }

  getStatistics(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/statistics`)
      .pipe(map(res => (res.data || []).map(e => mapId(e))));
  }

  getNavItems(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/nav`)
      .pipe(map(res => (res.data || []).map(e => mapId(e))));
  }

  getProfile(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/profile`)
      .pipe(map(res => res.data ? mapId(res.data) : null));
  }

  login(email: string, password: string): Observable<{ token: string; admin: any }> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(map(res => res.data));
  }
}
