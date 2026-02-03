import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { ApiService } from "./api.service";
import { Chapter } from "../models/chapter.model";
import { ApiResponse } from "../models/api-response.model";

@Injectable({ providedIn: "root" })
export class ChaptersService {
  constructor(private api: ApiService) {}

  /** Student / teacher / admin: read one chapter by id */
  getById(id: number): Observable<Chapter> {
    return this.api
      .get<ApiResponse<{ chapter: Chapter }>>(`/api/chapters/${id}`)
      .pipe(
        map(res => res.data.chapter)
      );
  }

  /** Student / teacher: list chapters by courseId */
  getByCourse(courseId: number): Observable<Chapter[]> {
    return this.api
      .get<ApiResponse<{ chapters: Chapter[] }>>(
        `/api/chapters`,
        { courseId } // uses ApiService params correctly
      )
      .pipe(
        map(res => res.data.chapters)
      );
  }

  /** Teacher: create chapter */
  create(body: any) {
    return this.api.post(`/api/chapters`, body);
  }

  /** Teacher: update chapter */
  update(id: number, body: any) {
    // backend expects PATCH for partial updates
    return this.api.patch(`/api/chapters/${id}`, body);
  }

  /** Teacher / admin: delete chapter */
  delete(id: number) {
    return this.api.delete(`/api/chapters/${id}`);
  }
}
