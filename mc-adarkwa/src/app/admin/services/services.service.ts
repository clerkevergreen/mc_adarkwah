import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Service } from '../../../app/models/service.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const mapId = (item: any): any => {
  if (!item) return item;
  const { _id, __v, ...rest } = item;
  return { id: _id, ...rest };
};

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Service[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/services`).pipe(map(res => (res.data || []).map(e => mapId(e) as Service)));
  }

  create(data: Partial<Service>): Observable<Service> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/services`, data).pipe(map(res => mapId(res.data) as Service));
  }

  update(id: string, data: Partial<Service>): Observable<Service> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/services/${id}`, data).pipe(map(res => mapId(res.data) as Service));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/services/${id}`).pipe(map(res => undefined));
  }
}
