import chaptersService from "../services/chapters.service.js";
import { success, error } from "../utils/response.js";

function ensureTeacher(req, res) {
  const user = req.user;
  if (!user) return { ok: false, res: error(res, 401, "Unauthorized") };
  if (user.role !== "TEACHER") return { ok: false, res: error(res, 403, "Forbidden") };
  return { ok: true, user };
}

export async function listByCourse(req, res, next) {
  try {
    // accept courseId from path param or query string
    const raw = req.params.courseId ?? req.query?.courseId;
    if (raw === undefined) return error(res, 400, "courseId is required (path or ?courseId=)");

    const courseId = Number(raw);
    if (Number.isNaN(courseId)) return error(res, 400, "courseId must be a number");

    // optional search query (keeps API flexible)
    const q = req.query?.q ?? null;

    const chapters = await chaptersService.listByCourse(courseId, q);
    return success(res, 200, { chapters });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 400, "Chapter id must be a number");

    const chapter = await chaptersService.getById(id);
    return success(res, 200, { chapter });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const check = ensureTeacher(req, res);
    if (!check.ok) return;

    // accept courseId from either params or body (body may use snake_case from external clients)
    const courseIdRaw = req.params.courseId ?? req.body?.course_id ?? req.body?.courseId;
    const courseId = Number(courseIdRaw);
    if (Number.isNaN(courseId)) return error(res, 400, "courseId must be a number (path or body.course_id)");

    // accept both camelCase and snake_case body keys for compatibility with external callers
    const payload = {
      title: req.body?.title ?? req.body?.title_text ?? null,
      content: req.body?.content ?? req.body?.body ?? null,
      orderIndex: req.body?.orderIndex ?? req.body?.order_index ?? req.body?.order ?? undefined,
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

export async function update(req, res, next) {
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

export async function remove(req, res, next) {
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
