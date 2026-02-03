import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

export type ConsultationCreateBody = {
  courseId: number;
  chapterId?: number | null;
};

@Injectable({ providedIn: "root" })
export class ConsultationsService {
  constructor(private api: ApiService) {}

  /**
   * Student: create a consultation record
   * Backend exposes two endpoints:
   * - POST /api/consultations/course/:courseId
   * - POST /api/consultations/chapter/:chapterId
   * Use the chapter endpoint when chapterId is present, otherwise use the course endpoint.
   */
  create(body: ConsultationCreateBody): Observable<any> {
    const chapterId = body.chapterId ?? null;
    if (chapterId) {
      return this.api.post(`/api/consultations/chapter/${Number(chapterId)}`);
    }

    // courseId is required if chapterId not provided
    return this.api.post(`/api/consultations/course/${Number(body.courseId)}`);
  }
}
