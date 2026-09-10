import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface CreateLessonPayload {
  userId: number;
  title: string;
  topic: string;
  rawText: string;
  language: string;
}

export interface GetLessonsParams {
  title?: string;
  topic?: string;
  userId: number;
}

export interface LessonDto {
  id: number;
  title: string;
  topic: string;
  rawText?: string;
  createdAt?: string;
  date?: string;
  writing?: number;
  reading?: number;
  writingScore?: number;
  readingScore?: number;
}

export type LessonsResponse = { data: LessonDto[] };

@Injectable({ providedIn: 'root' })
export class LessonService extends BaseApiService {
  protected override readonly serviceName = 'base' as const;

  createLesson(payload: CreateLessonPayload): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/lessons`, payload, {
      headers: {
        Accept: '*/*',
        'Accept-Language': payload.language,
      },
    });
  }

  getLessons(params: GetLessonsParams): Observable<LessonsResponse> {
    let queryParams = new HttpParams().set('userId', String(params.userId));

    if (params.title) queryParams = queryParams.set('title', params.title);
    if (params.topic) queryParams = queryParams.set('topic', params.topic);

    return this.http.get<LessonsResponse>(`${this.baseUrl}/lessons`, {
      params: queryParams,
      headers: {
        Accept: '*/*',
        'Accept-Language': 'en',
      },
    });
  }

  deleteLesson(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.baseUrl}/lessons/${id}`, {
      headers: {
        Accept: '*/*',
        'Accept-Language': 'en',
      },
    });
  }
}
