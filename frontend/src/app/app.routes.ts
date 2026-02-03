import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const appRoutes: Routes = [
  // =========================
  // Public area (AuthLayout)
  // =========================
  {
    path: '',
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout.component')
        .then(m => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/public/landing/landing.component')
            .then(m => m.LandingComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/public/login/login.component')
            .then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/public/register/register.component')
            .then(m => m.RegisterComponent),
      },
      {
        path: 'unauthorized',
        loadComponent: () =>
          import('./features/public/unauthorised/unauthorized.component')
            .then(m => m.UnauthorizedComponent),
      },
    ],
  },   

  // =========================
  // Protected area (MainLayout)
  // =========================
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component')
            .then(m => m.ProfileComponent),
      },

      {
        path: 'announcements',
        canActivate: [roleGuard],
        data: { roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
        loadComponent: () =>
          import('./features/student/announcements/announcements.component')
            .then(m => m.AnnouncementsComponent),
      },
      {
        path: 'announcements/:id',
        canActivate: [roleGuard],
        data: { roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
        loadComponent: () =>
          import('./features/student/announcement-details/announcement-details.component')
            .then(m => m.AnnouncementDetailsComponent),
      },

      // -------- Student --------
      {
        path: 'student',
        canActivate: [roleGuard],
        data: { roles: ['STUDENT'] },
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/student/dashboard/student-dashboard.component')
                .then(m => m.StudentDashboardComponent),
          },
          {
            path: 'courses',
            loadComponent: () =>
              import('./features/student/courses/student-courses.component')
                .then(m => m.StudentCoursesComponent),
          },
          {
            path: 'course-details/:id',
            loadComponent: () =>
              import('./features/student/course-details/student-course-details.component')
                .then(m => m.StudentCourseDetailsComponent),
          },
          {
            path: 'chapter-view/:id',
            loadComponent: () =>
              import('./features/student/chapter-view/chapter-view.component')
                .then(m => m.ChapterViewComponent),
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
      },

      // -------- Teacher --------
      {
        path: 'teacher',
        canActivate: [roleGuard],
        data: { roles: ['TEACHER'] },
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/teacher/dashboard/teacher-dashboard.component')
                .then(m => m.TeacherDashboardComponent),
          },
          {
            path: 'courses-manage',
            loadComponent: () =>
              import('./features/teacher/courses-manage/courses-manage.component')
                .then(m => m.CoursesManageComponent),
          },
          {
            path: 'chapters-manage',
            loadComponent: () =>
              import('./features/teacher/chapters-manage/chapters-manage.component')
                .then(m => m.ChaptersManageComponent),
          },
          {
            path: 'stats',
            loadComponent: () =>
              import('./features/teacher/stats/teacher-stats.component')
                .then(m => m.TeacherStatsComponent),
          },
          {
            path: 'announcements',
            loadComponent: () =>
              import('./features/teacher/announcements-manage/announcements-manage.component')
                .then(m => m.AnnouncementsManageComponent),
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
      },

      // -------- Admin --------
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/admin/dashboard/admin-dashboard.component')
                .then(m => m.AdminDashboardComponent),
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/users/admin-users.component')
                .then(m => m.AdminUsersComponent),
          },
          {
            path: 'logs',
            loadComponent: () =>
              import('./features/admin/logs/admin-logs.component')
                .then(m => m.AdminLogsComponent),
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
