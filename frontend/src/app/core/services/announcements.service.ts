// src/app/core/services/announcements.service.ts

import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { ApiService } from "./api.service";
import { ApiResponse, AnnouncementsListData, Announcement } from "../models/announcement.model";

@Injectable({ providedIn: "root" })
export class AnnouncementsService {
  private readonly base = "/api/announcements";

  constructor(private api: ApiService) {}

  /**
   * GET /api/announcements
   * Returns: { success, message, data: { announcements: Announcement[] } }
   */
  getAll(params?: { teacherId?: number }): Observable<Announcement[]> {
    return this.api.get<ApiResponse<AnnouncementsListData>>(this.base, params).pipe(
      map((res) => res.data.announcements)
    );
  }

  /**
   * GET /api/announcements/:id
   */
  getById(id: number): Observable<Announcement> {
    return this.api
      .get<ApiResponse<{ announcement: Announcement }>>(`${this.base}/${id}`)
      .pipe(map((res) => res.data.announcement));
  }

  /**
   * POST /api/announcements
   * Teacher/Admin creates announcement
   * Body: { title, content }
   * Response shape depends on backend (often returns created announcement)
   */
  create(payload: { title: string; content: string }): Observable<any> {
    return this.api.post<any>(this.base, payload);
  }

  /**
   * PATCH /api/announcements/:id
   * Body: { title, content }
   */
  update(id: number, payload: { title: string; content: string }): Observable<any> {
    // backend uses PATCH for updates
    return this.api.patch<any>(`${this.base}/${id}`, payload);
  }

  /**
   * DELETE /api/announcements/:id
   */
  remove(id: number): Observable<any> {
    return this.api.delete<any>(`${this.base}/${id}`);
  }
}
