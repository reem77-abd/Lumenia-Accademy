import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { Role } from '../models/user.models';
import { UserStore } from '../services/user.store';

export function roleGuard(allow: Role[]): CanActivateFn {
  return () => {
    const store = inject(UserStore);
    const router = inject(Router);

    const user = store.user(); // ✅ signal read
    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    if (!allow.includes(user.role)) {
      router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  };
}
