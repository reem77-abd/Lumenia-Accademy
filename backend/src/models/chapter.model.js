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
    const stmt = db.prepare(sql);
    const info = stmt.run(params);
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
  if (isBetterSqlite3(db)) {
    return Promise.resolve(db.prepare(sql).get(params));
  }
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  if (isBetterSqlite3(db)) {
    return Promise.resolve(db.prepare(sql).all(params));
  }
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

export async function listByCourse(courseId) {
  const sql = `
    SELECT
      id,
      course_id,
      title,
      content,
      order_index,
      created_at
    FROM chapters
    WHERE course_id = ?
    ORDER BY order_index ASC, created_at ASC
  `;
  return all(sql, [courseId]);
}

export async function getById(chapterId) {
  const sql = `
    SELECT
      id,
      course_id,
      title,
      content,
      order_index,
      created_at
    FROM chapters
    WHERE id = ?
  `;
  return get(sql, [chapterId]);
}

export async function getCourseOwnerId(courseId) {
  const sql = `SELECT teacher_id FROM courses WHERE id = ?`;
  const row = await get(sql, [courseId]);
  return row ? row.teacher_id : null;
}

export async function getCourseOwnerIdByChapter(chapterId) {
  const sql = `
    SELECT c.teacher_id AS teacher_id
    FROM chapters ch
    JOIN courses c ON c.id = ch.course_id
    WHERE ch.id = ?
  `;
  const row = await get(sql, [chapterId]);
  return row ? row.teacher_id : null;
}

/**
 * Get chapter by id AND course_id (useful when caller provides both)
 */
export async function getByIdAndCourse(chapterId, courseId) {
  const sql = `
    SELECT
      id,
      course_id,
      title,
      content,
      order_index,
      created_at
    FROM chapters
    WHERE id = ? AND course_id = ?
  `;
  return get(sql, [chapterId, courseId]);
}

export async function create({ courseId, title, content, orderIndex }) {
  const sql = `
    INSERT INTO chapters (course_id, title, content, order_index)
    VALUES (?, ?, ?, ?)
  `;
  const info = await run(sql, [courseId, title, content, orderIndex]);
  return getById(info.lastInsertRowid);
}

export async function update({ chapterId, title, content, orderIndex }) {
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
  if (orderIndex !== undefined) {
    sets.push("order_index = ?");
    params.push(orderIndex);
  }

  if (sets.length === 0) {
    return { changes: 0, chapter: await getById(chapterId) };
  }

  params.push(chapterId);

  const sql = `
    UPDATE chapters
    SET ${sets.join(", ")}
    WHERE id = ?
  `;

  const info = await run(sql, params);
  return { changes: info.changes, chapter: await getById(chapterId) };
}

export async function remove(chapterId) {
  const sql = `DELETE FROM chapters WHERE id = ?`;
  const info = await run(sql, [chapterId]);
  return info.changes;
}

export default {
  listByCourse,
  getById,
  getCourseOwnerId,
  getCourseOwnerIdByChapter,
  create,
  update,
  remove,
};
