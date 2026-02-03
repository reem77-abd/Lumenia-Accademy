// src/app/core/services/teacher-stats.service.ts

import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { ApiService } from "./api.service";
import { ApiResponse, TeacherStatsMeData, TeacherStats } from "../models/stats.model";

@Injectable({ providedIn: "root" })
export class TeacherStatsService {
  private readonly base = "/api/teacher-stats";

  constructor(private api: ApiService) {}

  getMe(): Observable<TeacherStats> {
    return this.api.get<ApiResponse<TeacherStatsMeData>>(`${this.base}/me`).pipe(
      map((res) => res.data.stats)
    );
  }
}
