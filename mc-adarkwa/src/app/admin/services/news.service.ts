import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NewsItem } from '../../../app/models/news.model';

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
export class NewsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getNews(params?: Record<string, any>): Observable<NewsItem[]> {
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
      .get<ApiResponse<any[]>>(`${this.apiUrl}/news${qs ? '?' + qs : ''}`)
      .pipe(map(res => (res.data || []).map(e => mapId(e) as NewsItem)));
  }

  createNews(data: Partial<NewsItem>): Observable<NewsItem> {
    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}/news`, data)
      .pipe(map(res => mapId(res.data) as NewsItem));
  }

  updateNews(id: string, data: Partial<NewsItem>): Observable<NewsItem> {
    return this.http
      .put<ApiResponse<any>>(`${this.apiUrl}/news/${id}`, data)
      .pipe(map(res => mapId(res.data) as NewsItem));
  }

  deleteNews(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/news/${id}`)
      .pipe(map(res => undefined));
  }
}
