// src/app/core/models/announcement.model.ts

export interface Announcement {
  id: number;
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  title: string;
  content: string;
  created_at: string; // backend sends "YYYY-MM-DD HH:mm:ss"
}

export interface AnnouncementsListData {
  announcements: Announcement[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
