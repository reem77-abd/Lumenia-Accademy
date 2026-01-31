// src/models/course.model.js
const db = require("../config/db");

/**
 * Small DB adapter that works with:
 * - sqlite3 (db.get/all/run callbacks)
 * - better-sqlite3 (db.prepare().get/all/run)
 */
function isBetterSqlite3(instance) {
  return instance && typeof instance.prepare === "function";
}

function run(sql, params = []) {
  if (isBetterSqlite3(db)) {
    const stmt = db.prepare(sql);
    const info = stmt.run(params);
    return Promise.resolve(info); // { changes, lastInsertRowid }
  }

  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      // sqlite3 provides lastID + changes via `this`
      resolve({ lastInsertRowid: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  if (isBetterSqlite3(db)) {
    const stmt = db.prepare(sql);
    return Promise.resolve(stmt.get(params));
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
    const stmt = db.prepare(sql);
    return Promise.resolve(stmt.all(params));
  }

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function listCourses({ teacherId, q }) {
  const where = [];
  const params = [];

  if (teacherId !== undefined) {
    where.push("c.teacher_id = ?");
    params.push(teacherId);
  }

  if (q) {
    // Simple search on title + description
    where.push("(c.title LIKE ? OR IFNULL(c.description,'') LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    SELECT
      c.id,
      c.title,
      c.description,
      c.teacher_id,
      c.created_at,
      u.name  AS teacher_name,
      u.email AS teacher_email
    FROM courses c
    JOIN users u ON u.id = c.teacher_id
    ${whereSql}
    ORDER BY c.created_at DESC
  `;

  return all(sql, params);
}

async function getCourseById(courseId) {
  const sql = `
    SELECT
      c.id,
      c.title,
      c.description,
      c.teacher_id,
      c.created_at,
      u.name  AS teacher_name,
      u.email AS teacher_email
    FROM courses c
    JOIN users u ON u.id = c.teacher_id
    WHERE c.id = ?
  `;
  return get(sql, [courseId]);
}

async function createCourse({ title, description, teacherId }) {
  const sql = `
    INSERT INTO courses (title, description, teacher_id)
    VALUES (?, ?, ?)
  `;
  const info = await run(sql, [title, description ?? null, teacherId]);
  return getCourseById(info.lastInsertRowid);
}

async function updateCourse({ courseId, title, description }) {
  // Build dynamic SET to avoid overwriting with undefined
  const sets = [];
  const params = [];

  if (title !== undefined) {
    sets.push("title = ?");
    params.push(title);
  }
  if (description !== undefined) {
    sets.push("description = ?");
    params.push(description);
  }

  if (sets.length === 0) return getCourseById(courseId);

  params.push(courseId);

  const sql = `
    UPDATE courses
    SET ${sets.join(", ")}
    WHERE id = ?
  `;

  const info = await run(sql, params);
  return { changes: info.changes, course: await getCourseById(courseId) };
}

async function deleteCourse(courseId) {
  const sql = `DELETE FROM courses WHERE id = ?`;
  const info = await run(sql, [courseId]);
  return info.changes; // number of rows deleted
}

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
