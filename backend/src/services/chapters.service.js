import chapterModel from "../models/chapter.model.js";
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

export async function listByCourse(courseId) {
  // Public
  return chapterModel.listByCourse(courseId);
}

export async function getById(chapterId) {
  const chapter = await chapterModel.getById(chapterId);
  if (!chapter) throw httpError(404, "Chapter not found");
  return chapter;
}

export async function create({ courseId, payload, actor }) {
  requireTeacher(actor);

  // Ownership check: teacher must own this course
  const ownerId = await chapterModel.getCourseOwnerId(courseId);
  if (!ownerId) throw httpError(404, "Course not found");
  if (ownerId !== actor.id) throw httpError(403, "You can only add chapters to your own courses");

  const title = payload?.title ? String(payload.title).trim() : "";
  const content = payload?.content ? String(payload.content) : "";
  const orderIndexRaw = payload?.orderIndex;

  if (!title || title.length < 2) throw httpError(400, "Title is required (min 2 characters)");
  if (!content || content.length < 1) throw httpError(400, "Content is required");

  let orderIndex = 1;
  if (orderIndexRaw !== undefined) {
    const n = Number(orderIndexRaw);
    if (Number.isNaN(n) || n < 1) throw httpError(400, "orderIndex must be a positive number");
    orderIndex = Math.floor(n);
  }

  return chapterModel.create({
    courseId,
    title,
    content,
    orderIndex,
  });
}

export async function update({ chapterId, patch, actor }) {
  requireTeacher(actor);

  const existing = await chapterModel.getById(chapterId);
  if (!existing) throw httpError(404, "Chapter not found");

  const ownerId = await chapterModel.getCourseOwnerIdByChapter(chapterId);
  if (!ownerId) throw httpError(404, "Course not found");
  if (ownerId !== actor.id) throw httpError(403, "You can only update chapters in your own courses");

  const title = patch?.title !== undefined ? String(patch.title).trim() : undefined;
  const content = patch?.content !== undefined ? String(patch.content) : undefined;

  let orderIndex = undefined;
  if (patch?.orderIndex !== undefined) {
    const n = Number(patch.orderIndex);
    if (Number.isNaN(n) || n < 1) throw httpError(400, "orderIndex must be a positive number");
    orderIndex = Math.floor(n);
  }

  if (title !== undefined && title.length < 2) throw httpError(400, "Title must be at least 2 characters");
  if (content !== undefined && content.length < 1) throw httpError(400, "Content cannot be empty");

  const { chapter } = await chapterModel.update({
    chapterId,
    title,
    content,
    orderIndex,
  });

  return chapter;
}

export async function remove({ chapterId, actor }) {
  requireTeacher(actor);

  const existing = await chapterModel.getById(chapterId);
  if (!existing) throw httpError(404, "Chapter not found");

  const ownerId = await chapterModel.getCourseOwnerIdByChapter(chapterId);
  if (!ownerId) throw httpError(404, "Course not found");
  if (ownerId !== actor.id) throw httpError(403, "You can only delete chapters in your own courses");

  const changes = await chapterModel.remove(chapterId);
  if (!changes) throw httpError(404, "Chapter not found");

  // ✅ ADD AUDIT LOG
  try {
    await AuditService.logDeleteAction({
      req: null,
      userId: actor.id,
      entityType: AuditService.AUDIT_ENTITIES.CHAPTER,
      entityId: chapterId,
      meta: {
        chapterTitle: existing.title,
        courseId: existing.course_id,
      },
    });
  } catch (auditErr) {
    console.error("Failed to log chapter deletion:", auditErr);
    // Don't fail the delete if audit logging fails
  }
}

export default {
  listByCourse,
  getById,
  create,
  update,
  remove,
};
