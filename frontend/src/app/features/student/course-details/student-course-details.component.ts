import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { ChaptersService } from '../../../core/services/chapters.service';
import { CoursesService } from '../../../core/services/courses.service';
import type { Course } from '../../../core/models/course.model';
import type { Chapter } from '../../../core/models/chapter.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-student-course-details',
  standalone: true,
  imports: [NgIf, NgFor, LoadingComponent],
  templateUrl: './student-course-details.component.html',
})
export class StudentCourseDetailsComponent implements OnInit {
  loading = false;
  error: string | null = null;

  courseId!: number;
  course: Course | null = null;
  chapters: Chapter[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursesService: CoursesService,
    private chaptersService: ChaptersService
  ) {}

  async ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.courseId) {
      this.error = 'Invalid course id';
      return;
    }
    await this.load();
  }

  async load() {
    this.loading = true;
    this.error = null;

    try {
      // 1) Course header
      this.course = await firstValueFrom(this.coursesService.getById(this.courseId));

      // 2) Chapters list
      this.chapters = await firstValueFrom(this.chaptersService.getByCourse(this.courseId));
    } catch (e: any) {
      this.error = e?.error?.error?.message || e?.error?.message || 'Failed to load course';
    } finally {
      this.loading = false;
    }
  }

  openChapter(chapterId: number) {
    this.router.navigate(['/student/chapter-view', chapterId]);
  }

  backToCourses() {
    this.router.navigate(['/student/courses']);
  }
}
