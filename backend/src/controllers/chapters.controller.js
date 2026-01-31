// src/controllers/chapters.controller.js
const chaptersService = require("../services/chapters.service");
const { success, error } = require("../utils/response");

function ensureTeacher(req, res) {
  const user = req.user;
  if (!user) return { ok: false, res: error(res, 401, "Unauthorized") };
  if (user.role !== "TEACHER") return { ok: false, res: error(res, 403, "Forbidden") };
  return { ok: true, user };
}

/**
 * GET /api/chapters/course/:courseId
 * Public: list chapters by course
 */
async function listByCourse(req, res, next) {
  try {
    const courseId = Number(req.params.courseId);
    if (Number.isNaN(courseId)) return error(res, 400, "courseId must be a number");

    const chapters = await chaptersService.listByCourse(courseId);
    return success(res, 200, { chapters });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chapters/:id
 * Public: chapter details
 */
async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 400, "Chapter id must be a number");

    const chapter = await chaptersService.getById(id);
    return success(res, 200, { chapter });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chapters/course/:courseId
 * Teacher: create chapter in owned course
 * Body: { title, content, orderIndex? }
 */
async function create(req, res, next) {
  try {
    const check = ensureTeacher(req, res);
    if (!check.ok) return;

    const courseId = Number(req.params.courseId);
    if (Number.isNaN(courseId)) return error(res, 400, "courseId must be a number");

    const payload = {
      title: req.body?.title,
      content: req.body?.content,
      orderIndex: req.body?.orderIndex,
    };

    const created = await chaptersService.create({
      courseId,
      payload,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 201, { chapter: created });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/chapters/:id
 * Teacher: update chapter (must own the course)
 * Body: { title?, content?, orderIndex? }
 */
async function update(req, res, next) {
  try {
    const check = ensureTeacher(req, res);
    if (!check.ok) return;

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 400, "Chapter id must be a number");

    const patch = {
      title: req.body?.title,
      content: req.body?.content,
      orderIndex: req.body?.orderIndex,
    };

    const updated = await chaptersService.update({
      chapterId: id,
      patch,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 200, { chapter: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/chapters/:id
 * Teacher: delete chapter (must own the course)
 */
async function remove(req, res, next) {
  try {
    const check = ensureTeacher(req, res);
    if (!check.ok) return;

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 400, "Chapter id must be a number");

    await chaptersService.remove({
      chapterId: id,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 200, { message: "Chapter deleted successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listByCourse,
  getById,
  create,
  update,
  remove,
};
