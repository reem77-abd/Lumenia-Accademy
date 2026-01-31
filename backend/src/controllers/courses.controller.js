import coursesService from "../services/courses.service.js";
import { success, error } from "../utils/response.js";

function ensureTeacher(req, res) {
  const user = req.user;
  if (!user) return { ok: false, res: error(res, 401, "Unauthorized") };
  if (user.role !== "TEACHER") return { ok: false, res: error(res, 403, "Forbidden") };
  return { ok: true, user };
}

export async function listCourses(req, res, next) {
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

export async function getCourseById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return error(res, 400, "Course id must be a number");

    const course = await coursesService.getCourseById(id);
    return success(res, 200, { course });
  } catch (err) {
    next(err);
  }
}

export async function createCourse(req, res, next) {
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

export async function updateCourse(req, res, next) {
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

export async function deleteCourse(req, res, next) {
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
