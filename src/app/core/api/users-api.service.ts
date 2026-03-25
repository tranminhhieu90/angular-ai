import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService, QueryParams } from './base-api.service';
import { USERS_API_BASE_URL } from './api.config';

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin' | 'staff' | 'customer';
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService extends BaseApiService {
  protected readonly apiBaseUrl = inject(USERS_API_BASE_URL);

  getUsers(params?: QueryParams): Observable<UserDto[]> {
    return this.get<UserDto[]>('users', { params });
  }

  getUserById(userId: string): Observable<UserDto> {
    return this.get<UserDto>(`users/${userId}`);
  }

  updateProfile(userId: string, payload: UpdateProfileRequest): Observable<UserDto> {
    return this.patch<UserDto, UpdateProfileRequest>(`users/${userId}`, payload);
  }
}
