// src/services/courses.service.js
const courseModel = require("../models/course.model");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function requireTeacher(actor) {
  if (!actor || !actor.id) throw httpError(401, "Unauthorized");
  if (actor.role !== "TEACHER") throw httpError(403, "Forbidden");
}

async function listCourses(filters) {
  // Public endpoint: no auth required here
  return courseModel.listCourses({
    teacherId: filters?.teacherId,
    q: filters?.q,
  });
}

async function getCourseById(courseId) {
  const course = await courseModel.getCourseById(courseId);
  if (!course) throw httpError(404, "Course not found");
  return course;
}

async function createCourse({ payload, actor }) {
  requireTeacher(actor);

  const title = payload?.title ? String(payload.title).trim() : "";
  const description =
    payload?.description !== undefined ? String(payload.description) : undefined;

  if (!title || title.length < 3) {
    throw httpError(400, "Title is required (min 3 characters)");
  }

  return courseModel.createCourse({
    title,
    description,
    teacherId: actor.id,
  });
}

async function updateCourse({ courseId, patch, actor }) {
  requireTeacher(actor);

  const existing = await courseModel.getCourseById(courseId);
  if (!existing) throw httpError(404, "Course not found");

  // Ownership enforcement: teacher can only update their own course
  if (existing.teacher_id !== actor.id) {
    throw httpError(403, "You can only update your own courses");
  }

  const title =
    patch?.title !== undefined ? String(patch.title).trim() : undefined;
  const description =
    patch?.description !== undefined ? String(patch.description) : undefined;

  if (title !== undefined && title.length < 3) {
    throw httpError(400, "Title must be at least 3 characters");
  }

  const { changes, course } = await courseModel.updateCourse({
    courseId,
    title,
    description,
  });

  if (!changes) {
    // No rows updated usually means nothing changed (or course missing, but we checked)
    return course;
  }

  return course;
}

async function deleteCourse({ courseId, actor }) {
  requireTeacher(actor);

  const existing = await courseModel.getCourseById(courseId);
  if (!existing) throw httpError(404, "Course not found");

  // Ownership enforcement
  if (existing.teacher_id !== actor.id) {
    throw httpError(403, "You can only delete your own courses");
  }

  const changes = await courseModel.deleteCourse(courseId);
  if (!changes) throw httpError(404, "Course not found");

  // Note: audit log for DELETE_ACTION should be handled by Niema's audit service,
  // or you can add it here later if the project decides services write audit logs.
}

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
