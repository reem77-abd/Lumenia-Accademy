// src/services/announcements.service.js
const announcementModel = require("../models/announcement.model");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function requireTeacher(actor) {
  if (!actor || !actor.id) throw httpError(401, "Unauthorized");
  if (actor.role !== "TEACHER") throw httpError(403, "Forbidden");
}

async function list({ teacherId } = {}) {
  return announcementModel.list({ teacherId });
}

async function getById(announcementId) {
  const ann = await announcementModel.getById(announcementId);
  if (!ann) throw httpError(404, "Announcement not found");
  return ann;
}

async function create({ payload, actor }) {
  requireTeacher(actor);

  const title = payload?.title ? String(payload.title).trim() : "";
  const content = payload?.content ? String(payload.content).trim() : "";

  if (!title || title.length < 3) throw httpError(400, "Title is required (min 3 characters)");
  if (!content || content.length < 3) throw httpError(400, "Content is required (min 3 characters)");

  return announcementModel.create({
    teacherId: actor.id,
    title,
    content,
  });
}

async function update({ announcementId, patch, actor }) {
  requireTeacher(actor);

  const existing = await announcementModel.getById(announcementId);
  if (!existing) throw httpError(404, "Announcement not found");

  // Ownership check
  if (existing.teacher_id !== actor.id) {
    throw httpError(403, "You can only update your own announcements");
  }

  const title = patch?.title !== undefined ? String(patch.title).trim() : undefined;
  const content = patch?.content !== undefined ? String(patch.content).trim() : undefined;

  if (title !== undefined && title.length < 3) throw httpError(400, "Title must be at least 3 characters");
  if (content !== undefined && content.length < 3) throw httpError(400, "Content must be at least 3 characters");

  const { announcement } = await announcementModel.update({
    announcementId,
    title,
    content,
  });

  return announcement;
}

async function remove({ announcementId, actor }) {
  requireTeacher(actor);

  const existing = await announcementModel.getById(announcementId);
  if (!existing) throw httpError(404, "Announcement not found");

  // Ownership check
  if (existing.teacher_id !== actor.id) {
    throw httpError(403, "You can only delete your own announcements");
  }

  const changes = await announcementModel.remove(announcementId);
  if (!changes) throw httpError(404, "Announcement not found");

  // Optional later: audit log DELETE_ACTION (ANNOUNCEMENT)
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
