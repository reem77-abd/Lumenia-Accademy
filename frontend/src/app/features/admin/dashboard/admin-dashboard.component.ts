import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AdminService } from "../../../core/services/admin.service";
import { catchError, of, take } from "rxjs";
import { finalize } from 'rxjs/operators';

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.css"],
})
export class AdminDashboardComponent implements OnInit {
  loading = false;
  usersCount = 0;
  activeCount = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loading = true;
    this.adminService
      .listUsers()
      .pipe(
        finalize(() => (this.loading = false)),
        take(1), // guarantees completion after first emission
        catchError(() => of([] as any[])) // never hang UI, fallback to empty list
      )
      .subscribe((users: any[]) => {
        const list = Array.isArray(users) ? users : [];
        this.usersCount = list.length;

        // Your API returns is_active (snake_case) from backend
        this.activeCount = list.filter((u: any) => {
          const isActive =
            u.is_active ??
            u.isActive ??
            u.active ??
            (u.status === "active");
          return isActive === 1 || isActive === true;
        }).length;
        this.loading = false;
      });
  }
}
