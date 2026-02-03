// src/app/core/models/user.model.ts

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;

  is_active: number;     // 1 or 0 from backend
  created_at: string;    // "YYYY-MM-DD HH:mm:ss"
}

/**
 * Optional convenience type for UI usage (clean booleans, camelCase).
 * Use only if you prefer mapping in services/components.
 */
export interface UserUI {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}
