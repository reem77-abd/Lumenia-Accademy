// src/models/announcement.model.js
const db = require("../config/db");

function isBetterSqlite3(instance) {
  return instance && typeof instance.prepare === "function";
}

function run(sql, params = []) {
  if (isBetterSqlite3(db)) {
    const info = db.prepare(sql).run(params);
    return Promise.resolve(info);
  }
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastInsertRowid: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  if (isBetterSqlite3(db)) return Promise.resolve(db.prepare(sql).get(params));
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  if (isBetterSqlite3(db)) return Promise.resolve(db.prepare(sql).all(params));
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * List announcements (optionally filter by teacher)
 */
async function list({ teacherId } = {}) {
  const where = [];
  const params = [];

  if (teacherId !== undefined) {
    where.push("a.teacher_id = ?");
    params.push(teacherId);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    SELECT
      a.id,
      a.teacher_id,
      u.name  AS teacher_name,
      u.email AS teacher_email,
      a.title,
      a.content,
      a.created_at
    FROM announcements a
    JOIN users u ON u.id = a.teacher_id
    ${whereSql}
    ORDER BY a.created_at DESC
  `;

  return all(sql, params);
}

async function getById(announcementId) {
  const sql = `
    SELECT
      a.id,
      a.teacher_id,
      u.name  AS teacher_name,
      u.email AS teacher_email,
      a.title,
      a.content,
      a.created_at
    FROM announcements a
    JOIN users u ON u.id = a.teacher_id
    WHERE a.id = ?
  `;
  return get(sql, [announcementId]);
}

async function create({ teacherId, title, content }) {
  const sql = `
    INSERT INTO announcements (teacher_id, title, content)
    VALUES (?, ?, ?)
  `;
  const info = await run(sql, [teacherId, title, content]);
  return getById(info.lastInsertRowid);
}

async function update({ announcementId, title, content }) {
  const sets = [];
  const params = [];

  if (title !== undefined) {
    sets.push("title = ?");
    params.push(title);
  }
  if (content !== undefined) {
    sets.push("content = ?");
    params.push(content);
  }

  if (sets.length === 0) {
    return { changes: 0, announcement: await getById(announcementId) };
  }

  params.push(announcementId);

  const sql = `
    UPDATE announcements
    SET ${sets.join(", ")}
    WHERE id = ?
  `;

  const info = await run(sql, params);
  return { changes: info.changes, announcement: await getById(announcementId) };
}

async function remove(announcementId) {
  const sql = `DELETE FROM announcements WHERE id = ?`;
  const info = await run(sql, [announcementId]);
  return info.changes;
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
