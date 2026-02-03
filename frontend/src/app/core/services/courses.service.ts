import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { ApiService } from "./api.service";
import { Course } from "../models/course.model";
import { CoursesListResponse, CourseOneResponse } from "../models/course-response.model";

@Injectable({ providedIn: "root" })
export class CoursesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Course[]> {
    return this.api.get<CoursesListResponse>(`/api/courses`).pipe(
      map((res) => res.data.courses)
    );
  }

  getById(id: number): Observable<Course> {
    return this.api.get<CourseOneResponse>(`/api/courses/${id}`).pipe(
      map((res) => res.data.course)
    );
  }

  create(body: Partial<Course>): Observable<Course> {
    // depends on backend response; keep as-is if backend returns the course
    return this.api.post<any>(`/api/courses`, body).pipe(
      map((res) => res.data?.course ?? res.data ?? res)
    );
  }

  update(id: number, body: Partial<Course>): Observable<Course> {
    // backend exposes PATCH for partial updates
    return this.api.patch<any>(`/api/courses/${id}`, body).pipe(
      map((res) => res.data?.course ?? res.data ?? res)
    );
  }

  delete(id: number): Observable<any> {
    return this.api.delete(`/api/courses/${id}`);
  }
}
