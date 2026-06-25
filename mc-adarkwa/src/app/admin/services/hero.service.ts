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

export interface HeroContent {
  id?: string;
  badge: string;
  title: string;
  subtitle: string;
  primaryBtnText: string;
  primaryBtnAction: string;
  secondaryBtnText: string;
  secondaryBtnAction: string;
  stat1Value: string;
  stat1Label: string;
  stat1Icon: string;
  stat2Value: string;
  stat2Label: string;
  stat2Icon: string;
}

@Injectable({ providedIn: 'root' })
export class HeroService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  get(): Observable<HeroContent> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/hero`).pipe(map(res => mapId(res.data) as HeroContent));
  }

  update(data: Partial<HeroContent>): Observable<HeroContent> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/hero`, data).pipe(map(res => mapId(res.data) as HeroContent));
  }
}
