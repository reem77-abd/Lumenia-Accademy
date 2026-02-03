import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import type { Role } from '../models/user.model';
import { UserService } from '../services/user.service';

export function roleGuard(allow?: Role[]): CanActivateFn {
  return (route?: ActivatedRouteSnapshot) => {
    const userService = inject(UserService);
    const router = inject(Router);

    const user = userService.user(); // signal read (same idea as your UserStore)
    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    const roles = allow ?? (route?.data?.['roles'] as Role[] | undefined);
    if (roles && !roles.includes(user.role)) {
      router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  };
}
