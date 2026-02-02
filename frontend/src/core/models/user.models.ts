export type Role = "admin" | "teacher" | "student";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}


