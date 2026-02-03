export interface Chapter {
  id: number;

  // backend (snake_case)
  course_id: number;
  title: string;
  content?: string;
  order_index?: number;
  created_at?: string;
}
