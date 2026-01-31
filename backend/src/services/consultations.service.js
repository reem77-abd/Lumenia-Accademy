// src/services/consultations.service.js
const consultationModel = require("../models/consultation.model");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function requireRole(actor, role) {
  if (!actor || !actor.id) throw httpError(401, "Unauthorized");
  if (actor.role !== role) throw httpError(403, "Forbidden");
}

async function consultCourse({ courseId, actor }) {
  requireRole(actor, "STUDENT");

  const course = await consultationModel.getCourseById(courseId);
  if (!course) throw httpError(404, "Course not found");

  return consultationModel.create({
    studentId: actor.id,
    courseId,
    chapterId: null,
  });
}

async function consultChapter({ chapterId, actor }) {
  requireRole(actor, "STUDENT");

  const chapter = await consultationModel.getChapterWithCourse(chapterId);
  if (!chapter) throw httpError(404, "Chapter not found");

  return consultationModel.create({
    studentId: actor.id,
    courseId: chapter.course_id,
    chapterId: chapter.id,
  });
}

async function listTeacherConsultations({ actor }) {
  requireRole(actor, "TEACHER");
  return consultationModel.listByTeacher(actor.id);
}

module.exports = {
  consultCourse,
  consultChapter,
  listTeacherConsultations,
};
