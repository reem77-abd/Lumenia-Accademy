import consultationModel from "../models/consultation.model.js";

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function requireRole(actor, role) {
  if (!actor || !actor.id) throw httpError(401, "Unauthorized");
  if (actor.role !== role) throw httpError(403, "Forbidden");
}

export async function consultCourse({ courseId, actor }) {
  requireRole(actor, "STUDENT");

  const course = await consultationModel.getCourseById(courseId);
  if (!course) throw httpError(404, "Course not found");

  return consultationModel.create({
    studentId: actor.id,
    courseId,
    chapterId: null,
  });
}

export async function consultChapter({ chapterId, courseId = null, actor }) {
  requireRole(actor, "STUDENT");

  // Prefer direct chapter lookup by id. If not found and caller provided a courseId,
  // attempt a (chapterId + courseId) lookup — this handles clients that submit both.
  let chapter = await consultationModel.getChapterWithCourse(chapterId);
  if (!chapter && courseId !== null && courseId !== undefined) {
    chapter = await (await import("../models/chapter.model.js")).getByIdAndCourse(chapterId, courseId);
  }

  if (!chapter) throw httpError(404, "Chapter not found");

  return consultationModel.create({
    studentId: actor.id,
    courseId: chapter.course_id,
    chapterId: chapter.id,
  });
}

export async function listTeacherConsultations({ actor }) {
  requireRole(actor, "TEACHER");
  return consultationModel.listByTeacher(actor.id);
}

export default {
  consultCourse,
  consultChapter,
  listTeacherConsultations,
};
