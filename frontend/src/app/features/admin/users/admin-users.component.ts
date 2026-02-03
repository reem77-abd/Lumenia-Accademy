import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AdminService } from "../../../core/services/admin.service";
import { User } from "../../../core/models/user.model";
import { catchError, of, take } from "rxjs";
import { finalize } from 'rxjs/operators';

@Component({
  selector: "app-admin-users",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./admin-users.component.html",
  styleUrls: ["./admin-users.component.css"],
})
export class AdminUsersComponent implements OnInit {
  loading = false;
  error: string | null = null;
  users: User[] = [];
  search = "";

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.error = null;
    this.adminService
      .listUsers()
      .pipe(
        finalize(() => (this.loading = false)),
        take(1),
        catchError((e) => {
          this.error = e?.error?.error?.message || e?.error?.message || "Could not load users.";
          return of([] as User[]);
        })
      )
      .subscribe((list) => {
        this.users = Array.isArray(list) ? list : [];
        this.loading = false;
      });
  }

  filtered(): User[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.users;

    return this.users.filter((u: any) => {
      const name = `${u.name ?? ""}`.toLowerCase();
      const email = `${u.email ?? ""}`.toLowerCase();
      const role = `${u.role ?? ""}`.toLowerCase();
      return name.includes(q) || email.includes(q) || role.includes(q);
    });
  }

  isActive(u: any): boolean {
    const v = u.is_active ?? u.isActive ?? u.active ?? (u.status === "active");
    return v === 1 || v === true;
  }

  toggleActive(u: any): void {
    const prev = this.isActive(u);
    const next = !prev;

    // optimistic UI update (instant, no spinner)
    (u as any).is_active = next ? 1 : 0;

    // Backend expects { is_active } with 1/0 values
    const payload = { is_active: next ? 1 : 0 };

    this.adminService
      .updateUser((u as any).id, payload)
      .pipe(
        take(1),
        catchError(() => {
          // revert if API fails
          (u as any).is_active = prev ? 1 : 0;
          return of(null);
        })
      )
      .subscribe(() => {
        // no refetch needed; UI already updated
      });
  }
}
