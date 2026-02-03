import type { Role } from '../../core/models/user.model';

export const isStudent = (role: Role) => role === 'STUDENT';
export const isTeacher = (role: Role) => role === 'TEACHER';
export const isAdmin = (role: Role) => role === 'ADMIN';
