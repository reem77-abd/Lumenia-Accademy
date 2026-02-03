import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CoursesService } from "../../../core/services/courses.service";
import { ChaptersService } from "../../../core/services/chapters.service";
import { Course } from "../../../core/models/course.model";
import { Chapter } from "../../../core/models/chapter.model";

@Component({
  selector: "app-chapters-manage",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chapters-manage.component.html",
  styleUrls: ["./chapters-manage.component.css"],
})
export class ChaptersManageComponent implements OnInit {
  loading = false;
  error: string | null = null;

  courses: Course[] = [];
  selectedCourseId: number | null = null;

  chapters: Chapter[] = [];
  editingId: number | null = null;

  form: any = { title: "", content: "" };

  constructor(
    private coursesService: CoursesService,
    private chaptersService: ChaptersService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = null;

    this.coursesService.getAll().subscribe({
      next: (list) => {
        this.courses = list || [];
        this.loading = false;

        if (!this.selectedCourseId && this.courses.length) {
          this.selectedCourseId = this.courses[0].id;
          this.loadChapters();
        }
      },
      error: () => {
        this.loading = false;
        this.error = "Could not load courses.";
      },
    });
  }

  loadChapters(): void {
    if (!this.selectedCourseId) return;

    this.loading = true;
    this.error = null;

    this.chaptersService.getByCourse(this.selectedCourseId).subscribe({
      next: (list) => {
        this.chapters = list || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = "Could not load chapters.";
      },
    });
  }

  startCreate(): void {
    this.editingId = null;
    this.form = { title: "", content: "" };
  }

  startEdit(ch: Chapter): void {
    this.editingId = ch.id;
    this.form = {
      title: (ch as any).title ?? "",
      content: (ch as any).content ?? (ch as any).description ?? "",
    };
  }

  save(): void {
    if (!this.selectedCourseId) return;

    const payload: any = {
      courseId: this.selectedCourseId,
      title: this.form.title,
      content: this.form.content,
    };

    this.loading = true;
    this.error = null;

    const req = this.editingId
      ? this.chaptersService.update(this.editingId, payload)
      : this.chaptersService.create(payload);

    req.subscribe({
      next: () => {
        this.loading = false;
        this.startCreate();
        this.loadChapters();
      },
      error: () => {
        this.loading = false;
        this.error = "Save failed.";
      },
    });
  }

  remove(id: number): void {
    if (!confirm("Delete this chapter?")) return;

    this.loading = true;
    this.error = null;

    this.chaptersService.delete(id).subscribe({
      next: () => {
        this.loading = false;
        this.loadChapters();
      },
      error: () => {
        this.loading = false;
        this.error = "Delete failed.";
      },
    });
  }
}
