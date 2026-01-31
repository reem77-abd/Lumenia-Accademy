// src/models/consultation.model.js
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

async function getCourseById(courseId) {
  return get(`SELECT id, teacher_id, title FROM courses WHERE id = ?`, [courseId]);
}

async function getChapterWithCourse(chapterId) {
  const sql = `
    SELECT id, course_id, title
    FROM chapters
    WHERE id = ?
  `;
  return get(sql, [chapterId]);
}

async function create({ studentId, courseId, chapterId }) {
  const sql = `
    INSERT INTO consultations (student_id, course_id, chapter_id)
    VALUES (?, ?, ?)
  `;
  const info = await run(sql, [studentId, courseId, chapterId]);

  return get(
    `
      SELECT
        id, student_id, course_id, chapter_id, consulted_at
      FROM consultations
      WHERE id = ?
    `,
    [info.lastInsertRowid]
  );
}

async function listByTeacher(teacherId) {
  const sql = `
    SELECT
      con.id,
      con.student_id,
      u.name AS student_name,
      u.email AS student_email,
      con.course_id,
      c.title AS course_title,
      con.chapter_id,
      ch.title AS chapter_title,
      con.consulted_at
    FROM consultations con
    JOIN courses c ON c.id = con.course_id
    JOIN users u ON u.id = con.student_id
    LEFT JOIN chapters ch ON ch.id = con.chapter_id
    WHERE c.teacher_id = ?
    ORDER BY con.consulted_at DESC
  `;
  return all(sql, [teacherId]);
}

module.exports = {
  getCourseById,
  getChapterWithCourse,
  create,
  listByTeacher,
};
