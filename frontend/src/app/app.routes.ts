import { Routes } from '@angular/router';

import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { LoginComponent } from './pages/auth/login/login';

import { AdminHome } from './pages/admin/admin-home/admin-home';
import { TeacherHome } from './pages/teacher/teacher-home/teacher-home';
import { StudentHome } from './pages/student/student-home/student-home';
import { Unauthorized } from './pages/common/unauthorized/unauthorized';
import { NotFound } from './pages/common/not-found/not-found';

import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [{ path: 'login', component: LoginComponent }],
  },

  { path: 'unauthorized', component: Unauthorized },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'admin', component: AdminHome, canActivate: [roleGuard(['admin'])] },
      { path: 'teacher', component: TeacherHome, canActivate: [roleGuard(['teacher'])] },
      { path: 'student', component: StudentHome, canActivate: [roleGuard(['student'])] },
    ],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: NotFound },
];
