// core/services/base-api.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiConfigService } from './api-config.service';

@Injectable() // ← bỏ providedIn vì sẽ được extend
export class BaseApiService {
  protected readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  // Child service khai báo service name
  protected readonly serviceName!: Parameters<ApiConfigService['getUrl']>[0];

  protected get baseUrl(): string {
    return this.apiConfig.getUrl(this.serviceName);
  }

  protected get<T>(endpoint: string, params?: Record<string, string>): Observable<T> {
    const httpParams = params ? new HttpParams({ fromObject: params }) : undefined;
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  protected post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  protected put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body).pipe(catchError(this.handleError));
  }

  protected patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`).pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    let message = 'Đã xảy ra lỗi. Vui lòng thử lại.';
    if (error.status === 0) message = 'Không thể kết nối đến server.';
    if (error.status === 401) message = 'Phiên đăng nhập hết hạn.';
    if (error.status === 403) message = 'Bạn không có quyền thực hiện thao tác này.';
    if (error.status === 404) message = 'Không tìm thấy tài nguyên.';
    if (error.status >= 500) message = 'Lỗi server. Vui lòng thử lại sau.';
    return throwError(() => ({ ...error, message }));
  }
}
