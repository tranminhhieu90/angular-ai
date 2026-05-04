// core/services/api-config.service.ts
import { environment } from '@/app/environments/environment';
import { Injectable } from '@angular/core';

type ServiceName = keyof typeof environment.services;

@Injectable({ providedIn: 'root' })
export class ApiConfigService {
  getUrl(service: ServiceName): string {
    return environment.services[service];
  }
}
