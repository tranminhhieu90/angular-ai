import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface UnitDto {
  id: number;
  name: string;
  description?: string;
  thumbnail_url?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnitsResponse {
  data: UnitDto[];
  total?: number;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class UnitService extends BaseApiService {
  protected override readonly serviceName = 'base' as const;

  getUnits(params?: { page?: number; limit?: number }): Observable<UnitsResponse | UnitDto[]> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams['page'] = String(params.page);
    if (params?.limit) queryParams['limit'] = String(params.limit);

    return this.http.get<UnitsResponse | UnitDto[]>(`${this.baseUrl}/units`, {
      params: queryParams,
      headers: {
        Accept: '*/*',
        'Accept-Language': 'en',
      },
    });
  }
}
