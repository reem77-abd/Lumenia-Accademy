import courseModel from "../models/course.model.js";
import AuditService from "./audit.service.js";

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function requireTeacher(actor) {
  if (!actor || !actor.id) throw httpError(401, "Unauthorized");
  if (actor.role !== "TEACHER") throw httpError(403, "Forbidden");
}

export async function listCourses(filters) {
  // Public endpoint: no auth required here
  return courseModel.listCourses({
    teacherId: filters?.teacherId,
    q: filters?.q,
  });
}

export async function getCourseById(courseId) {
  const course = await courseModel.getCourseById(courseId);
  if (!course) throw httpError(404, "Course not found");
  return course;
}

export async function createCourse({ payload, actor }) {
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

export async function updateCourse({ courseId, patch, actor }) {
  requireTeacher(actor);

  const existing = await courseModel.getCourseById(courseId);
  if (!existing) throw httpError(404, "Course not found");

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
    return course;
  }

  return course;
}

export async function deleteCourse({ courseId, actor }) {
  requireTeacher(actor);

  const existing = await courseModel.getCourseById(courseId);
  if (!existing) throw httpError(404, "Course not found");

  if (existing.teacher_id !== actor.id) {
    throw httpError(403, "You can only delete your own courses");
  }

  const changes = await courseModel.deleteCourse(courseId);
  if (!changes) throw httpError(404, "Course not found");

  // ✅ ADD AUDIT LOG
  try {
    await AuditService.logDeleteAction({
      req: null,
      userId: actor.id,
      entityType: AuditService.AUDIT_ENTITIES.COURSE,
      entityId: courseId,
      meta: {
        courseTitle: existing.title,
        teacherId: existing.teacher_id,
      },
    });
  } catch (auditErr) {
    console.error("Failed to log course deletion:", auditErr);
    // Don't fail the delete if audit logging fails
  }
}

export default {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
