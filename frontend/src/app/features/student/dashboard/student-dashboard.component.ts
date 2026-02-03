import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CoursesService } from '../../../core/services/courses.service';
import type { Course } from '../../../core/models/course.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, LoadingComponent],
  templateUrl: './student-dashboard.component.html',
})
export class StudentDashboardComponent implements OnInit {
  loading = false;
  error: string | null = null;

  courses: Course[] = [];

  constructor(private coursesService: CoursesService, private router: Router) {}

  async ngOnInit() {
    await this.loadCourses();
  }

  async loadCourses() {
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

  openCourse(courseId: number) {
    // Next page in your structure: student/course-details
    this.router.navigate(['/student/course-details', courseId]);
  }
}
