import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CoursesService } from "../../../core/services/courses.service";
import { Course } from "../../../core/models/course.model";

@Component({
  selector: "app-courses-manage",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./courses-manage.component.html",
  styleUrls: ["./courses-manage.component.css"],
})
export class CoursesManageComponent implements OnInit {
  loading = false;
  error: string | null = null;

  courses: Course[] = [];

  form: Partial<Course> = { title: "", description: "" };
  editingId: number | null = null;

  constructor(private coursesService: CoursesService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.error = null;

    this.coursesService.getAll().subscribe({
      next: (list) => {
        this.courses = list || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = "Could not load courses.";
      },
    });
  }

  startCreate(): void {
    this.editingId = null;
    this.form = { title: "", description: "" };
  }

  startEdit(c: Course): void {
    this.editingId = c.id;
    this.form = { title: (c as any).title ?? "", description: (c as any).description ?? "" };
  }

  save(): void {
    const payload = { ...this.form };

    this.loading = true;
    this.error = null;

    const req = this.editingId
      ? this.coursesService.update(this.editingId, payload)
      : this.coursesService.create(payload);

    req.subscribe({
      next: () => {
        this.loading = false;
        this.startCreate();
        this.fetch();
      },
      error: () => {
        this.loading = false;
        this.error = "Save failed.";
      },
    });
  }

  remove(id: number): void {
    if (!confirm("Delete this course?")) return;

    this.loading = true;
    this.error = null;

    this.coursesService.delete(id).subscribe({
      next: () => {
        this.loading = false;
        this.fetch();
      },
      error: () => {
        this.loading = false;
        this.error = "Delete failed.";
      },
    });
  }
}
