import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  params?: QueryParams;
  headers?: HttpHeaders | Record<string, string | string[]>;
}

@Injectable({ providedIn: 'root' })
export abstract class BaseApiService {
  protected readonly http = inject(HttpClient);
  protected abstract readonly apiBaseUrl: string;

  protected get<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), {
      params: this.toHttpParams(options?.params),
      headers: options?.headers,
    });
  }

  protected post<T, B = unknown>(path: string, body: B, options?: RequestOptions): Observable<T> {
    return this.http.post<T>(this.buildUrl(path), body, {
      params: this.toHttpParams(options?.params),
      headers: options?.headers,
    });
  }

  protected put<T, B = unknown>(path: string, body: B, options?: RequestOptions): Observable<T> {
    return this.http.put<T>(this.buildUrl(path), body, {
      params: this.toHttpParams(options?.params),
      headers: options?.headers,
    });
  }

  protected patch<T, B = unknown>(path: string, body: B, options?: RequestOptions): Observable<T> {
    return this.http.patch<T>(this.buildUrl(path), body, {
      params: this.toHttpParams(options?.params),
      headers: options?.headers,
    });
  }

  protected delete<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(this.buildUrl(path), {
      params: this.toHttpParams(options?.params),
      headers: options?.headers,
    });
  }

  private buildUrl(path: string): string {
    const normalizedBase = this.apiBaseUrl.replace(/\/+$/, '');
    const normalizedPath = path.replace(/^\/+/, '');
    return `${normalizedBase}/${normalizedPath}`;
  }

  private toHttpParams(params?: QueryParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams;
  }
}
