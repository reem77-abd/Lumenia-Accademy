// src/controllers/consultations.controller.js
const consultationsService = require("../services/consultations.service");
const { success, error } = require("../utils/response");

function ensureUser(req, res) {
  const user = req.user;
  if (!user) return { ok: false, res: error(res, 401, "Unauthorized") };
  return { ok: true, user };
}

/**
 * POST /api/consultations/course/:courseId
 * STUDENT: inserts a consultation (chapter_id = NULL)
 */
async function consultCourse(req, res, next) {
  try {
    const check = ensureUser(req, res);
    if (!check.ok) return;

    const courseId = Number(req.params.courseId);
    if (Number.isNaN(courseId)) return error(res, 400, "courseId must be a number");

    const created = await consultationsService.consultCourse({
      courseId,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 201, { consultation: created });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/consultations/chapter/:chapterId
 * STUDENT: inserts a consultation for chapter (course_id derived from chapter)
 */
async function consultChapter(req, res, next) {
  try {
    const check = ensureUser(req, res);
    if (!check.ok) return;

    const chapterId = Number(req.params.chapterId);
    if (Number.isNaN(chapterId)) return error(res, 400, "chapterId must be a number");

    const created = await consultationsService.consultChapter({
      chapterId,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 201, { consultation: created });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/consultations/teacher/me
 * TEACHER: list consultations on my courses
 */
async function listTeacherConsultations(req, res, next) {
  try {
    const check = ensureUser(req, res);
    if (!check.ok) return;

    const items = await consultationsService.listTeacherConsultations({
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 200, { consultations: items });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  consultCourse,
  consultChapter,
  listTeacherConsultations,
};
