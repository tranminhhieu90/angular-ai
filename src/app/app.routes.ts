// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '', // Khi vào "/"
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login', // /login
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
    title: 'Đăng nhập | Angular AI Demo',
  },
  {
    path: 'dashboard',
    // canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayoutComponent),
    title: 'Dashboard | Angular AI Demo',
    children: [
      {
        path: '', // /dashboard
        loadComponent: () =>
          import('./pages/dashboard/dashboard-home/dashboard-home').then(
            (m) => m.DashboardHomeComponent,
          ),
        title: 'Dashboard Home | Angular AI Demo',
      },
      {
        path: 'profile', // /dashboard/profile
        loadComponent: () =>
          import('./pages/dashboard/profile/profile').then((m) => m.ProfileComponent),
        title: 'Profile | Angular AI Demo',
      },
      {
        path: 'users', // /dashboard/users
        loadComponent: () => import('./pages/dashboard/users/users').then((m) => m.UsersComponent),
        title: 'User Management | Angular AI Demo',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/other-page/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: '404 Not Found | Angular AI Demo',
  },
];
