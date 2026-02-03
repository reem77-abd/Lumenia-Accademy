import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { AdminService } from "../../../core/services/admin.service";
import { AuditLogModel } from "../../../core/models/audit.model";
import { catchError, finalize, of, take } from "rxjs";
import { LoadingComponent } from "../../../shared/components/loading/loading.component";

@Component({
  selector: "app-admin-logs",
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: "./admin-logs.component.html",
  styleUrls: ["./admin-logs.component.css"],
})
export class AdminLogsComponent implements OnInit {
  loading = false;
  error: string | null = null;
  logs: AuditLogModel[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.error = null;

    this.adminService
      .getAuditLogs({ limit: 50, offset: 0 })
      .pipe(
        take(1),
        catchError((e) => {
          this.error =
            e?.error?.message ||
            e?.message ||
            "Could not load audit logs.";
          return of([] as AuditLogModel[]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((list) => {
        this.logs = Array.isArray(list) ? list : [];
      });
  }

  fmt(d: any): string {
    if (!d) return "-";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? String(d) : dt.toLocaleString();
  }
}
