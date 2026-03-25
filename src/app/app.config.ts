import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import {
  AUTH_API_BASE_URL,
  DASHBOARD_API_BASE_URL,
  ORDERS_API_BASE_URL,
  PRODUCTS_API_BASE_URL,
  USERS_API_BASE_URL,
} from './core/api/api.config';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { authRefreshInterceptor } from './core/interceptors/auth-refresh.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([authTokenInterceptor, authRefreshInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    provideEventPlugins(),
    { provide: AUTH_API_BASE_URL, useValue: '/api-auth' },
    { provide: USERS_API_BASE_URL, useValue: '/api-users' },
    { provide: PRODUCTS_API_BASE_URL, useValue: '/api-products' },
    { provide: ORDERS_API_BASE_URL, useValue: '/api-orders' },
    { provide: DASHBOARD_API_BASE_URL, useValue: '/api-dashboard' },
  ],
};
