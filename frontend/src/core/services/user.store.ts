import { Injectable, signal } from '@angular/core';
import type { User } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private _user = signal<User | null>(null);
  user = this._user.asReadonly();

  setUser(user: User) {
    this._user.set(user);
  }

  clear() {
    this._user.set(null);
  }
}
