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

export interface VideoHighlight {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  order: number;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class VideosService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<VideoHighlight[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/videos/all`).pipe(map(res => (res.data || []).map(e => mapId(e) as VideoHighlight)));
  }

  create(data: Partial<VideoHighlight>): Observable<VideoHighlight> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/videos`, data).pipe(map(res => mapId(res.data) as VideoHighlight));
  }

  update(id: string, data: Partial<VideoHighlight>): Observable<VideoHighlight> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/videos/${id}`, data).pipe(map(res => mapId(res.data) as VideoHighlight));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/videos/${id}`).pipe(map(res => undefined));
  }
}
