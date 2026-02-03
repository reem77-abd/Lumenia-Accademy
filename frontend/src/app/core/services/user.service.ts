import { Injectable, signal } from '@angular/core';
import type { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private _user = signal<User | null>(null);

  // read-only signal (what your guards call as userService.user())
  user = this._user.asReadonly();

  setUser(user: User) {
    this._user.set(user);
  }

  clear() {
    this._user.set(null);
  }
}
