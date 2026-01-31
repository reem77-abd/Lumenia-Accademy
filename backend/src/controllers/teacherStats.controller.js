// src/controllers/teacherStats.controller.js
const statsService = require("../services/stats.service");
const { success, error } = require("../utils/response");

function ensureTeacher(req, res) {
  const user = req.user;
  if (!user) return { ok: false, res: error(res, 401, "Unauthorized") };
  if (user.role !== "TEACHER") return { ok: false, res: error(res, 403, "Forbidden") };
  return { ok: true, user };
}

/**
 * GET /api/teacher-stats/me?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
async function getMyStats(req, res, next) {
  try {
    const check = ensureTeacher(req, res);
    if (!check.ok) return;

    const from = req.query?.from ? String(req.query.from) : undefined;
    const to = req.query?.to ? String(req.query.to) : undefined;

    const stats = await statsService.getTeacherStats({
      teacherId: check.user.id,
      from,
      to,
    });

    return success(res, 200, { stats });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyStats,
};
