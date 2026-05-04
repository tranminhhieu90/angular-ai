import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

// ─── Response Models ──────────────────────────────────────
export interface UserDto {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  email: string;
  userName: string;
  isEmailConfirmed: boolean;
  role: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface UsersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: UserDto[];
  errors: unknown | null;
  meta: PaginationMeta;
  path: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

// ─── Service ─────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class UserService extends BaseApiService {
  protected override readonly serviceName = 'user' as const;

  /**
   * Lấy danh sách user có phân trang
   * GET /users?page=1&limit=20
   */
  getUsers(params: GetUsersParams = {}): Observable<UsersResponse> {
    const queryParams: Record<string, string> = {};
    if (params.page != null) queryParams['page'] = String(params.page);
    if (params.limit != null) queryParams['limit'] = String(params.limit);

    return this.get<UsersResponse>('users', queryParams);
  }
}
