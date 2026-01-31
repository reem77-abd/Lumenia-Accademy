import consultationsService from "../services/consultations.service.js";
import { success, error } from "../utils/response.js";

function ensureUser(req, res) {
  const user = req.user;
  if (!user) return { ok: false, res: error(res, 401, "Unauthorized") };
  return { ok: true, user };
}

export async function consultCourse(req, res, next) {
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

export async function consultChapter(req, res, next) {
  try {
    const check = ensureUser(req, res);
    if (!check.ok) return;

    const chapterId = Number(req.params.chapterId ?? req.body?.chapter_id ?? req.body?.chapterId);
    if (Number.isNaN(chapterId)) return error(res, 400, "chapterId must be a number");

    // accept optional courseId from body or query — helpful for clients that send both
    const courseIdRaw = req.body?.course_id ?? req.body?.courseId ?? req.query?.courseId;
    const courseId = courseIdRaw !== undefined ? Number(courseIdRaw) : null;
    if (courseIdRaw !== undefined && Number.isNaN(courseId)) return error(res, 400, "courseId must be a number");

    const created = await consultationsService.consultChapter({
      chapterId,
      courseId,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 201, { consultation: created });
  } catch (err) {
    next(err);
  }
}

export async function listTeacherConsultations(req, res, next) {
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
