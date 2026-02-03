import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { ApiService } from "./api.service";
import { User } from "../models/user.model";
import { AuditLog } from "../models/audit.model";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface UpdateUserResponse {
  user: User;
}

// What the backend returns for logs (based on our planned controller):
// { success: true, message: "OK", data: { logs: AuditLog[] } }
interface AuditLogsResponse {
  logs: AuditLog[];
}

export interface AuditLogsQuery {
  userId?: number;
  action?: string;
  entityType?: string;
  entityId?: number;
  from?: string;   // sqlite datetime-compatible string
  to?: string;     // sqlite datetime-compatible string
  limit?: number;
  offset?: number;
  order?: "ASC" | "DESC";
}

@Injectable({ providedIn: "root" })
export class AdminService {
  private readonly base = "/api/admin";

  constructor(private api: ApiService) {}

  // Admin: list all users
  listUsers(): Observable<User[]> {
    return this.api
      .get<ApiResponse<User[]>>(`${this.base}/users`)
      .pipe(map((res) => res.data ?? []));
  }

  // Admin: activate/deactivate user (partial update)
  updateUser(id: number, body: Partial<User>): Observable<User> {
    return this.api
      .patch<ApiResponse<UpdateUserResponse>>(`${this.base}/users/${id}`, body)
      .pipe(map((res) => res.data?.user as User));
  }

  // Admin: audit logs (login attempts etc.)
  // Accepts optional filters + pagination.
  getAuditLogs(query?: AuditLogsQuery): Observable<AuditLog[]> {
    return this.api
      .get<ApiResponse<AuditLogsResponse> | any>(`${this.base}/logs`, query)
      .pipe(
        map((res) => {
          // Handle multiple possible shapes safely:
          // 1) res is array already
          if (Array.isArray(res)) return res as AuditLog[];

          // 2) standard wrapper: { success, data: { logs: [...] } }
          const logs1 = res?.data?.logs;
          if (Array.isArray(logs1)) return logs1 as AuditLog[];

          // 3) wrapper but data itself is array: { success, data: [...] }
          const logs2 = res?.data;
          if (Array.isArray(logs2)) return logs2 as AuditLog[];

          // 4) fallback: some servers return { logs: [...] }
          const logs3 = res?.logs;
          if (Array.isArray(logs3)) return logs3 as AuditLog[];

          // 5) 304/empty body / unexpected shape
          return [];
        })
      );
  }
}
