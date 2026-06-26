import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GalleryItem } from '../../../app/models/gallery.model';

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
export class GalleryService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getItems(params?: Record<string, any>): Observable<GalleryItem[]> {
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
      .get<ApiResponse<any[]>>(`${this.apiUrl}/gallery${qs ? '?' + qs : ''}`)
      .pipe(map(res => (res.data || []).map(e => mapId(e) as GalleryItem)));
  }

  private uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http
      .post<ApiResponse<{ url: string }>>(`${this.apiUrl}/upload`, formData)
      .pipe(map(res => res.data.url));
  }

  createItem(data: Partial<GalleryItem>, file?: File | null): Observable<GalleryItem> {
    const save = (imageUrl: string) => {
      const payload = { ...data, imageUrl, thumbnailUrl: imageUrl };
      delete (payload as any).file;
      return this.http
        .post<ApiResponse<any>>(`${this.apiUrl}/gallery`, payload)
        .pipe(map(res => mapId(res.data) as GalleryItem));
    };

    if (file) {
      return this.uploadFile(file).pipe(switchMap(url => save(url)));
    }
    return save(data.imageUrl || '');
  }

  updateItem(id: string, data: Partial<GalleryItem>, file?: File | null): Observable<GalleryItem> {
    const save = (imageUrl: string) => {
      const payload = { ...data, ...(imageUrl ? { imageUrl, thumbnailUrl: imageUrl } : {}) };
      delete (payload as any).file;
      return this.http
        .put<ApiResponse<any>>(`${this.apiUrl}/gallery/${id}`, payload)
        .pipe(map(res => mapId(res.data) as GalleryItem));
    };

    if (file) {
      return this.uploadFile(file).pipe(switchMap(url => save(url)));
    }
    return save('');
  }

  deleteItem(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/gallery/${id}`)
      .pipe(map(res => undefined));
  }
}
