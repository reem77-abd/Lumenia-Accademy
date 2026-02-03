import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CoursesService } from '../../../core/services/courses.service';
import type { Course } from '../../../core/models/course.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, LoadingComponent],
  templateUrl: './student-courses.component.html',
})
export class StudentCoursesComponent implements OnInit {
  loading = false;
  error: string | null = null;

  courses: Course[] = [];
  query = '';

  constructor(private coursesService: CoursesService, private router: Router) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    this.error = null;
    try {
      this.courses = await firstValueFrom(this.coursesService.getAll());
    } catch (e: any) {
      this.error = e?.error?.error?.message || e?.error?.message || 'Failed to load courses';
    } finally {
      this.loading = false;
    }
  }

  get filteredCourses(): Course[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.courses;
    return this.courses.filter(c => (c.title || '').toLowerCase().includes(q));
  }

  openCourse(courseId: number) {
    this.router.navigate(['/student/course-details', courseId]);
  }
}
