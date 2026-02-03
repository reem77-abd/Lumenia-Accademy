export interface Course {
  id: number;
  title: string;
  description?: string;

  // backend fields (snake_case)
  teacher_id?: number;
  teacher_name?: string;
  teacher_email?: string;

  created_at?: string;
}