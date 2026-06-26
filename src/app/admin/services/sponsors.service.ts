import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
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
export class SponsorsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getSponsors(): Observable<Sponsor[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/sponsors`)
      .pipe(map(res => (res.data || []).map(e => mapId(e) as Sponsor)));
  }

  createSponsor(data: Partial<Sponsor>): Observable<Sponsor> {
    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}/sponsors`, data)
      .pipe(map(res => mapId(res.data) as Sponsor));
  }

  updateSponsor(id: string, data: Partial<Sponsor>): Observable<Sponsor> {
    return this.http
      .put<ApiResponse<any>>(`${this.apiUrl}/sponsors/${id}`, data)
      .pipe(map(res => mapId(res.data) as Sponsor));
  }

  deleteSponsor(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/sponsors/${id}`)
      .pipe(map(res => undefined));
  }
}
