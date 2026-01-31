// src/controllers/announcements.controller.js
const announcementsService = require("../services/announcements.service");
const { success, error } = require("../utils/response");

function ensureTeacher(req, res) {
  const user = req.user;
  if (!user) return { ok: false, res: error(res, 401, "Unauthorized") };
  if (user.role !== "TEACHER") return { ok: false, res: error(res, 403, "Forbidden") };
  return { ok: true, user };
}

/**
 * GET /api/announcements?teacherId=
 * Public: list
 */
async function list(req, res, next) {
  try {
    const teacherIdRaw = req.query?.teacherId;
    const teacherId = teacherIdRaw !== undefined ? Number(teacherIdRaw) : undefined;

    if (teacherIdRaw !== undefined && Number.isNaN(teacherId)) {
      return error(res, 400, "teacherId must be a number");
    }

    const announcements = await announcementsService.list({ teacherId });
    return success(res, 200, { announcements });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/announcements/:id
 * Public: details
 */
async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 400, "Announcement id must be a number");

    const announcement = await announcementsService.getById(id);
    return success(res, 200, { announcement });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/announcements
 * Teacher: create
 * Body: { title, content }
 */
async function create(req, res, next) {
  try {
    const check = ensureTeacher(req, res);
    if (!check.ok) return;

    const payload = {
      title: req.body?.title,
      content: req.body?.content,
    };

    const created = await announcementsService.create({
      payload,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 201, { announcement: created });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/announcements/:id
 * Teacher: update own
 * Body: { title?, content? }
 */
async function update(req, res, next) {
  try {
    const check = ensureTeacher(req, res);
    if (!check.ok) return;

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 400, "Announcement id must be a number");

    const patch = {
      title: req.body?.title,
      content: req.body?.content,
    };

    const updated = await announcementsService.update({
      announcementId: id,
      patch,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 200, { announcement: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/announcements/:id
 * Teacher: delete own
 */
async function remove(req, res, next) {
  try {
    const check = ensureTeacher(req, res);
    if (!check.ok) return;

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 400, "Announcement id must be a number");

    await announcementsService.remove({
      announcementId: id,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 200, { message: "Announcement deleted successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
