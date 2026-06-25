import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const mapId = (item: any): any => {
  if (!item) return item;
  const { _id, __v, ...rest } = item;
  return { id: _id, ...rest };
};

export interface Statistic {
  id: string;
  value: number;
  suffix: string;
  label: string;
  icon: string;
  order: number;
}

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  get(): Observable<Statistic[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/statistics`).pipe(map(res => (res.data || []).map(e => mapId(e) as Statistic)));
  }

  create(data: Partial<Statistic>): Observable<Statistic> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/statistics`, data).pipe(map(res => mapId(res.data) as Statistic));
  }

  update(id: string, data: Partial<Statistic>): Observable<Statistic> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/statistics/${id}`, data).pipe(map(res => mapId(res.data) as Statistic));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/statistics/${id}`).pipe(map(res => undefined));
  }
}
