// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '', // /  →  trang Home
        loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
      },
      {
        path: 'login', // /login
        loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
      },
    ],
  },
  {
    path: 'dashboard',
    // canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayoutComponent),
    children: [
      {
        path: '', // /dashboard
        loadComponent: () =>
          import('./pages/dashboard/dashboard-home/dashboard-home').then(
            (m) => m.DashboardHomeComponent,
          ),
      },
      {
        path: 'profile', // /dashboard/profile
        loadComponent: () =>
          import('./pages/dashboard/profile/profile').then((m) => m.ProfileComponent),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
