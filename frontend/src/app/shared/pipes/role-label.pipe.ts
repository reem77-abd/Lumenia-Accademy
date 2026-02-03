import { Pipe, PipeTransform } from '@angular/core';
import type { Role } from '../../core/models/user.model';

@Pipe({
  name: 'roleLabel',
  standalone: true,
})
export class RoleLabelPipe implements PipeTransform {
  transform(role: Role): string {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'TEACHER':
        return 'Teacher';
      case 'STUDENT':
        return 'Student';
      default:
        return role;
    }
  }
}
