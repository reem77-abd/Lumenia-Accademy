// src/services/chapters.service.js
const chapterModel = require("../models/chapter.model");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function requireTeacher(actor) {
  if (!actor || !actor.id) throw httpError(401, "Unauthorized");
  if (actor.role !== "TEACHER") throw httpError(403, "Forbidden");
}

async function listByCourse(courseId) {
  // Public
  return chapterModel.listByCourse(courseId);
}

async function getById(chapterId) {
  const chapter = await chapterModel.getById(chapterId);
  if (!chapter) throw httpError(404, "Chapter not found");
  return chapter;
}

async function create({ courseId, payload, actor }) {
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

  // Note: UNIQUE(course_id, order_index) can throw constraint error if duplicated.
  // Your global error middleware can format it, or you can catch it later.
  return chapterModel.create({
    courseId,
    title,
    content,
    orderIndex,
  });
}

async function update({ chapterId, patch, actor }) {
  requireTeacher(actor);

  const existing = await chapterModel.getById(chapterId);
  if (!existing) throw httpError(404, "Chapter not found");

  // Ownership check: teacher must own the chapter's course
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

async function remove({ chapterId, actor }) {
  requireTeacher(actor);

  const existing = await chapterModel.getById(chapterId);
  if (!existing) throw httpError(404, "Chapter not found");

  const ownerId = await chapterModel.getCourseOwnerIdByChapter(chapterId);
  if (!ownerId) throw httpError(404, "Course not found");
  if (ownerId !== actor.id) throw httpError(403, "You can only delete chapters in your own courses");

  const changes = await chapterModel.remove(chapterId);
  if (!changes) throw httpError(404, "Chapter not found");

  // Optional later: write audit log DELETE_ACTION (CHAPTER)
}

module.exports = {
  listByCourse,
  getById,
  create,
  update,
  remove,
};
