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

export interface Profile {
  id?: string;
  name: string;
  title: string;
  bio: string;
  fullBio: string;
  image: string;
  image2: string;
  yearsExperience: number;
  achievements: string[];
  milestones: { year: string; title: string; description: string }[];
  socialMedia: Record<string, string>;
  contact: Record<string, string>;
  exchangeRate?: number;
  budgetRanges?: { min: number; max: number; label: string }[];
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  get(): Observable<Profile> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/profile`).pipe(map(res => mapId(res.data) as Profile));
  }

  update(data: Partial<Profile>): Observable<Profile> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/profile`, data).pipe(map(res => mapId(res.data) as Profile));
  }
}
