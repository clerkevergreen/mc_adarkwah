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

export interface NavItem {
  id: string;
  label: string;
  path: string;
  fragment: string;
  icon: string;
  order: number;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class NavService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<NavItem[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/nav/all`).pipe(map(res => (res.data || []).map(e => mapId(e) as NavItem)));
  }

  create(data: Partial<NavItem>): Observable<NavItem> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/nav`, data).pipe(map(res => mapId(res.data) as NavItem));
  }

  update(id: string, data: Partial<NavItem>): Observable<NavItem> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/nav/${id}`, data).pipe(map(res => mapId(res.data) as NavItem));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/nav/${id}`).pipe(map(res => undefined));
  }
}
