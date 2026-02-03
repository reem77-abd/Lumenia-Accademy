import { Course } from "./course.model";
import { ApiResponse } from "./api-response.model";

export type CoursesListResponse = ApiResponse<{ courses: Course[] }>;
export type CourseOneResponse = ApiResponse<{ course: Course }>;
