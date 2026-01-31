// src/controllers/courses.controller.js

const coursesService = require("../services/courses.service");
const { success, error } = require("../utils/response");

/**
 * Small helper: enforce TEACHER at controller level too (defense-in-depth).
 * Routes already block non-teachers, but this avoids surprises.
 */
function ensureTeacher(req, res) {
  const user = req.user;
  if (!user) return { ok: false, res: error(res, 401, "Unauthorized") };
  if (user.role !== "TEACHER") return { ok: false, res: error(res, 403, "Forbidden") };
  return { ok: true, user };
}

/**
 * GET /api/courses?teacherId=&q=
 * Public: list courses
 */
async function listCourses(req, res, next) {
  try {
    const { teacherId, q } = req.query;

    const filters = {
      teacherId: teacherId ? Number(teacherId) : undefined,
      q: q ? String(q).trim() : undefined,
    };

    if (filters.teacherId !== undefined && Number.isNaN(filters.teacherId)) {
      return error(res, 400, "teacherId must be a number");
    }

    const courses = await coursesService.listCourses(filters);
    return success(res, 200, { courses });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/courses/:id
 * Public: get course details
 */
async function getCourseById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 400, "Course id must be a number");

    const course = await coursesService.getCourseById(id);
    return success(res, 200, { course });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/courses
 * Teacher only: create course
 * Body: { title, description? }
 */
async function createCourse(req, res, next) {
  try {
    const check = ensureTeacher(req, res);
    if (!check.ok) return;

    const payload = {
      title: req.body?.title,
      description: req.body?.description,
    };

    const created = await coursesService.createCourse({
      payload,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 201, { course: created });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/courses/:id
 * Teacher only: update course (owner teacher enforced in service)
 * Body: { title?, description? }
 */
async function updateCourse(req, res, next) {
  try {
    const check = ensureTeacher(req, res);
    if (!check.ok) return;

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 400, "Course id must be a number");

    const patch = {
      title: req.body?.title,
      description: req.body?.description,
    };

    const updated = await coursesService.updateCourse({
      courseId: id,
      patch,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 200, { course: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/courses/:id
 * Teacher only: delete course (owner teacher enforced in service)
 */
async function deleteCourse(req, res, next) {
  try {
    const check = ensureTeacher(req, res);
    if (!check.ok) return;

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 400, "Course id must be a number");

    await coursesService.deleteCourse({
      courseId: id,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 200, { message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
