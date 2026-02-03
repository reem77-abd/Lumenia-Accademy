import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AnnouncementsService } from "../../../core/services/announcements.service";
import { UserService } from "../../../core/services/user.service";
import type { Announcement } from "../../../core/models/announcement.model";
import { ConfirmDialogComponent } from "../../../shared/components/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-announcements-manage",
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: "./announcements-manage.component.html",
  styleUrls: ["./announcements-manage.component.css"],
})
export class AnnouncementsManageComponent implements OnInit {
  private announcementsService = inject(AnnouncementsService);
  private userService = inject(UserService);

  loading = false;
  error: string | null = null;
  items: Announcement[] = [];

  editingId: number | null = null;
  form = {
    title: "",
    content: "",
  };

  confirmOpen = false;
  pendingDeleteId: number | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    const user = this.userService.user();
    const teacherId = user?.id;

    this.announcementsService.getAll(teacherId ? { teacherId } : undefined).subscribe({
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

  startCreate(): void {
    this.editingId = null;
    this.form = { title: "", content: "" };
  }

  startEdit(item: Announcement): void {
    this.editingId = item.id;
    this.form = { title: item.title, content: item.content };
  }

  save(): void {
    if (!this.form.title.trim() || !this.form.content.trim()) {
      this.error = "Title and content are required.";
      return;
    }

    this.loading = true;
    this.error = null;

    const request = this.editingId
      ? this.announcementsService.update(this.editingId, this.form)
      : this.announcementsService.create(this.form);

    request.subscribe({
      next: () => {
        this.startCreate();
        this.load();
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.error?.message || e?.error?.message || "Save failed";
      },
    });
  }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.confirmOpen = true;
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.confirmOpen = false;
  }

  doDelete(): void {
    if (!this.pendingDeleteId) return;

    this.loading = true;
    this.error = null;

    this.announcementsService.remove(this.pendingDeleteId).subscribe({
      next: () => {
        this.cancelDelete();
        this.load();
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.error?.message || e?.error?.message || "Delete failed";
      },
    });
  }
}
