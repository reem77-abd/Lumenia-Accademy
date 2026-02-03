import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AnnouncementsService } from "../../../core/services/announcements.service";
import type { Announcement } from "../../../core/models/announcement.model";

@Component({
  selector: "app-announcements",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./announcements.component.html",
  styleUrls: ["./announcements.component.css"],
})
export class AnnouncementsComponent implements OnInit {
  private announcementsService = inject(AnnouncementsService);
  private router = inject(Router);

  loading = false;
  error: string | null = null;
  items: Announcement[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.announcementsService.getAll().subscribe({
      next: (list) => {
        this.items = list || [];
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.error?.message || e?.error?.message || "Failed to load announcements";
      },
    });
  }

  open(item: Announcement): void {
    this.router.navigate(["/announcements", item.id]);
  }

  fmt(dateValue: string): string {
    try {
      return new Date(dateValue).toLocaleString();
    } catch {
      return dateValue;
    }
  }
}
