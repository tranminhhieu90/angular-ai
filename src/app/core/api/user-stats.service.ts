// core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

// ─── Service ──────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class UserStatsService extends BaseApiService {
  protected override readonly serviceName = 'base' as const;
  getTopic(params: any = {}): Observable<any> {
    return this.get<any>('stats/topics');
  }
}
