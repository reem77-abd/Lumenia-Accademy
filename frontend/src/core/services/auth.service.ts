import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';
import { TokenService } from './token.service';
import { UserStore } from './user.store';
import type { LoginRequest, LoginResponse } from '../models/auth.models';
import type { User } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private api: ApiService,
    private token: TokenService,
    private store: UserStore
  ) {}

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const res = await firstValueFrom(
      this.api.post<LoginResponse>('/api/auth/login', payload)
    );

    this.token.set(res.token);
    this.store.setUser(res.user);
    return res;
  }

  async me(): Promise<User> {
    const user = await firstValueFrom(this.api.get<User>('/api/auth/me'));
    this.store.setUser(user);
    return user;
  }

  logout(): void {
    this.token.clear();
    this.store.clear();
  }
}
