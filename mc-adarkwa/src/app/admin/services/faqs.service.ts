import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FAQ } from '../../../app/models/faq.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const mapId = (item: any): any => {
  if (!item) return item;
  const { _id, __v, ...rest } = item;
  return { id: _id, ...rest };
};

@Injectable({ providedIn: 'root' })
export class FaqsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getFAQs(): Observable<FAQ[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/faqs`)
      .pipe(map(res => (res.data || []).map(e => mapId(e) as FAQ)));
  }

  createFAQ(data: Partial<FAQ>): Observable<FAQ> {
    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}/faqs`, data)
      .pipe(map(res => mapId(res.data) as FAQ));
  }

  updateFAQ(id: string, data: Partial<FAQ>): Observable<FAQ> {
    return this.http
      .put<ApiResponse<any>>(`${this.apiUrl}/faqs/${id}`, data)
      .pipe(map(res => mapId(res.data) as FAQ));
  }

  deleteFAQ(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/faqs/${id}`)
      .pipe(map(res => undefined));
  }

  reorderFAQs(items: FAQ[]): Observable<FAQ[]> {
    const orders = items.map((item, index) => ({ id: item.id, order: index + 1 }));
    return this.http
      .put<ApiResponse<any[]>>(`${this.apiUrl}/faqs/reorder`, { orders })
      .pipe(map(res => (res.data || []).map(e => mapId(e) as FAQ)));
  }
}
