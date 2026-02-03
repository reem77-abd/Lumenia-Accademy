import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { UserService } from './user.service';

import type { LoginRequest, LoginResponse } from '../models/auth.model';
import type { User } from '../models/user.model';

interface AuthResponse {
  success: boolean;
  data: LoginResponse;
  message?: string;
}

interface MeResponse {
  success: boolean;
  data: { user: User };
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private api: ApiService,
    private token: TokenService,
    private userService: UserService
  ) {}

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const res = await firstValueFrom(
      this.api.post<AuthResponse>('/api/auth/login', payload)
    );

    this.token.set(res.data.token);
    this.userService.setUser(res.data.user);
    return res.data;
  }

  async me(): Promise<User> {
    const res = await firstValueFrom(this.api.get<MeResponse>('/api/auth/me'));
    this.userService.setUser(res.data.user);
    return res.data.user;
  }

  logout(): void {
    // Best-effort audit on backend; ignore failures.
    this.api.post('/api/auth/logout').subscribe({
      error: () => undefined,
    });
    this.token.clear();
    this.userService.clear();
  }
}
