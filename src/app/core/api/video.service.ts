import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface VideoDto {
  id: number;
  title: string;
  description?: string | null;
  url: string;
  public_id?: string;
  thumbnail_url?: string | null;
  duration?: number | null;
  unit_id: number;
  order_index?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideosResponse {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: VideoDto[];
  errors?: unknown;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

@Injectable({ providedIn: 'root' })
export class VideoService extends BaseApiService {
  protected override readonly serviceName = 'base' as const;

  getVideosByUnit(unitId: number): Observable<VideosResponse | VideoDto[]> {
    return this.http.get<VideosResponse | VideoDto[]>(`${this.baseUrl}/videos`, {
      params: { unit_id: String(unitId) },
      headers: { Accept: '*/*' },
    });
  }
}
