// app.routes.ts
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '', // Khi vào "/"
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
    title: 'Trang chủ | Wapple Engish',
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.component').then((m) => m.SignupComponent),
    title: 'Đăng ký | Wapple Engish',
  },
  {
    path: 'login', // /login
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
    title: 'Đăng nhập | Wapple Engish',
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
    title: 'Reset passowrd | Wapple Engish',
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayoutComponent),
    title: 'Dashboard | Wapple Engish',
    children: [
      {
        path: '', // /dashboard
        loadComponent: () =>
          import('./pages/dashboard/dashboard-home/dashboard-home').then(
            (m) => m.DashboardHomeComponent,
          ),
        title: 'Dashboard Home | Wapple Engish',
      },
      {
        path: 'profile', // /dashboard/profile
        loadComponent: () =>
          import('./pages/dashboard/profile/profile').then((m) => m.ProfileComponent),
        title: 'Profile | Wapple Engish',
      },
      {
        path: 'users', // /dashboard/users
        loadComponent: () => import('./pages/dashboard/users/users').then((m) => m.UsersComponent),
        title: 'User Management | Wapple Engish',
      },
    ],
  },
  {
    path: 'user-dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/user-layout/user-layout').then((m) => m.UserLayoutComponent),
    title: 'Dashboard | Wapple Engish',
    children: [
      {
        path: '', // /user-dashboard
        loadComponent: () =>
          import('./pages/user-dashboard/user-home/user-home').then((m) => m.UserHomeComponent),
        title: 'Home | Wapple Engish',
      },
      {
        path: 'create-lesson',
        loadComponent: () =>
          import('./pages/user-dashboard/create-lesson/create-lesson').then(
            (m) => m.CreateLessonComponent,
          ),
        title: 'Tạo bài học | Wapple Engish',
      },
      {
        path: 'lessons',
        loadComponent: () =>
          import('./pages/user-dashboard/lessons/lessons').then((m) => m.LessonsComponent),
        title: 'Danh sách bài | Wapple Engish',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/other-page/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: '404 Not Found | Wapple Engish',
  },
];
