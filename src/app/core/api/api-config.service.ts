// core/services/api-config.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

type ServiceName = keyof typeof environment.services;

@Injectable({ providedIn: 'root' })
export class ApiConfigService {
  getUrl(service: ServiceName): string {
    return environment.services[service];
  }
}
