import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

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
export class SubscribersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getSubscribers(): Observable<Subscriber[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/subscribers`)
      .pipe(map(res => (res.data || []).map(e => mapId(e) as Subscriber)));
  }

  deleteSubscriber(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/subscribers/${id}`)
      .pipe(map(() => undefined));
  }
}
