import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Subject, switchMap, takeUntil } from "rxjs";
import { ChaptersService } from "../../../core/services/chapters.service";
import { ConsultationsService } from "../../../core/services/consultations.service";
import { Chapter } from "../../../core/models/chapter.model";
import { finalize } from 'rxjs/operators';

@Component({
  selector: "app-chapter-view",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./chapter-view.component.html",
  styleUrls: ["./chapter-view.component.css"],
})
export class ChapterViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = true;
  error: string | null = null;

  chapter: Chapter | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chaptersService: ChaptersService,
    private consultationsService: ConsultationsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.loading = true;
          this.error = null;

          const id = Number(params.get("id"));
          if (!id || Number.isNaN(id)) {
            throw new Error("Invalid chapter id in route.");
          }
          return this.chaptersService.getById(id);
        })
      )
      .subscribe({
        next: (chapter) => {
          this.chapter = chapter;
          this.loading = false;

          // Auto-log consultation once (per chapter, per browser)
          this.logConsultationOnce(chapter);
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err?.message || "Could not load chapter. Please try again.";
        },
      });
  }

  private logConsultationOnce(chapter: Chapter): void {
    // Avoid spamming the database on refresh / back-forward
    const key = `luminia_consulted_chapter_${chapter.id}`;
    const already = localStorage.getItem(key);
    if (already) return;

    // If courseId exists in model, use it; otherwise try to fall back safely
    const courseId = (chapter as any).courseId ?? (chapter as any).course_id;
    if (!courseId) return;

    this.consultationsService
      .create({ courseId: Number(courseId), chapterId: chapter.id })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => localStorage.setItem(key, new Date().toISOString()),
        error: () => {
          // Silent fail: user can still read; we just don't record the consult.
        },
      });
  }

  backToCourse(): void {
    if (!this.chapter) {
      this.router.navigate(["/student/courses"]);
      return;
    }
    const courseId = (this.chapter as any).courseId ?? (this.chapter as any).course_id;
    if (courseId) {
      this.router.navigate(["/student/course-details", Number(courseId)]);
    } else {
      this.router.navigate(["/student/courses"]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
