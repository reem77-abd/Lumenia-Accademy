import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AnnouncementsService } from "../../../core/services/announcements.service";
import type { Announcement } from "../../../core/models/announcement.model";

@Component({
  selector: "app-announcement-details",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./announcement-details.component.html",
  styleUrls: ["./announcement-details.component.css"],
})
export class AnnouncementDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private announcementsService = inject(AnnouncementsService);

  loading = false;
  error: string | null = null;
  announcement: Announcement | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (!id) {
      this.error = "Invalid announcement id";
      return;
    }
    this.load(id);
  }

  load(id: number): void {
    this.loading = true;
    this.error = null;

    this.announcementsService.getById(id).subscribe({
      next: (item) => {
        this.announcement = item;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.error?.message || e?.error?.message || "Failed to load announcement";
      },
    });
  }

  back(): void {
    this.router.navigate(["/announcements"]);
  }

  fmt(dateValue: string): string {
    try {
      return new Date(dateValue).toLocaleString();
    } catch {
      return dateValue;
    }
  }
}
