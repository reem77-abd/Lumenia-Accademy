import db, { runWithRetry } from "../config/db.js";

function isBetterSqlite3(instance) {
  return (
    instance &&
    typeof instance.prepare === "function" &&
    // node-sqlite3 exposes `serialize()` — better-sqlite3 does NOT
    typeof instance.serialize !== "function"
  );
}

async function run(sql, params = []) {
  if (isBetterSqlite3(db)) {
    const info = db.prepare(sql).run(params);
    return Promise.resolve(info);
  }
  try {
    return await runWithRetry(sql, params);
  } catch (err) {
    if (err && err.code === "SQLITE_BUSY") {
      const e = new Error("DATABASE_BUSY");
      e.status = 503;
      throw e;
    }
    throw err;
  }
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
export async function list({ teacherId } = {}) {
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

export async function getById(announcementId) {
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

export async function create({ teacherId, title, content }) {
  const sql = `
    INSERT INTO announcements (teacher_id, title, content)
    VALUES (?, ?, ?)
  `;
  const info = await run(sql, [teacherId, title, content]);
  return getById(info.lastInsertRowid);
}

export async function update({ announcementId, title, content }) {
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

export async function remove(announcementId) {
  const sql = `DELETE FROM announcements WHERE id = ?`;
  const info = await run(sql, [announcementId]);
  return info.changes;
}

export default {
  list,
  getById,
  create,
  update,
  remove,
};
