import statsService from "../services/stats.service.js";
import { success, error } from "../utils/response.js";

function ensureTeacher(req, res) {
  const user = req.user;
  if (!user) return { ok: false, res: error(res, 401, "Unauthorized") };
  if (user.role !== "TEACHER") return { ok: false, res: error(res, 403, "Forbidden") };
  return { ok: true, user };
}

export async function getMyStats(req, res, next) {
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
