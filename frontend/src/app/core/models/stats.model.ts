// src/app/core/models/stats.model.ts

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TeacherStatsRange {
  from: string | null;
  to: string | null;
}

export interface TeacherStatsTotals {
  courses: number;
  chapters: number;
  consultations: number;
  consultationsCourseLevel: number;
  consultationsChapterLevel: number;
}

export interface TeacherStatsTopCourse {
  id: number;
  title: string;
  consultations: number;
}

export interface TeacherStatsTopChapter {
  id: number;
  title: string;
  course_id: number;
  course_title: string;
  consultations: number;
}

export interface TeacherStatsTimelineDaily {
  day: string; // "YYYY-MM-DD"
  consultations: number;
}

export interface TeacherStatsConsultationsPerCourse {
  id: number;
  title: string;
  consultations: number;
}

export interface TeacherStats {
  range: TeacherStatsRange;
  totals: TeacherStatsTotals;
  topCourses: TeacherStatsTopCourse[];
  topChapters: TeacherStatsTopChapter[];
  timelineDaily: TeacherStatsTimelineDaily[];
  consultationsPerCourse: TeacherStatsConsultationsPerCourse[];
}

export interface TeacherStatsMeData {
  stats: TeacherStats;
}
