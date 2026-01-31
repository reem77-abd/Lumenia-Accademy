// src/services/stats.service.js
const db = require("../config/db");

/**
 * DB adapter works with:
 * - sqlite3 (callbacks)
 * - better-sqlite3 (prepare)
 */
function isBetterSqlite3(instance) {
  return instance && typeof instance.prepare === "function";
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

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Validates YYYY-MM-DD (simple check)
 */
function isDateOnly(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/**
 * Stats for teacher:
 * - totals: courses, chapters, consultations
 * - top courses/chaps
 * - daily timeline (date -> count)
 *
 * Optional filter:
 * from/to are YYYY-MM-DD (inclusive)
 */
async function getTeacherStats({ teacherId, from, to }) {
  if (!teacherId) throw httpError(400, "teacherId is required");

  // Date filters (optional)
  if (from !== undefined && !isDateOnly(from)) throw httpError(400, "from must be YYYY-MM-DD");
  if (to !== undefined && !isDateOnly(to)) throw httpError(400, "to must be YYYY-MM-DD");

  // We'll filter consultations by consulted_at datetime.
  // Inclusive date range: >= from 00:00:00 and < (to + 1 day) 00:00:00
  // If only one is provided, we do one-sided range.
  let whereTime = "";
  const timeParams = [];

  if (from) {
    whereTime += ` AND con.consulted_at >= datetime(?)`;
    timeParams.push(`${from} 00:00:00`);
  }
  if (to) {
    whereTime += ` AND con.consulted_at < datetime(?, '+1 day')`;
    timeParams.push(`${to} 00:00:00`);
  }

  // 1) Totals: courses count
  const coursesRow = await get(
    `SELECT COUNT(*) AS count FROM courses WHERE teacher_id = ?`,
    [teacherId]
  );

  // 2) Totals: chapters count (in teacher's courses)
  const chaptersRow = await get(
    `
    SELECT COUNT(*) AS count
    FROM chapters ch
    JOIN courses c ON c.id = ch.course_id
    WHERE c.teacher_id = ?
    `,
    [teacherId]
  );

  // 3) Totals: consultations on teacher's courses (optionally in time range)
  const consultationsRow = await get(
    `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN con.chapter_id IS NULL THEN 1 ELSE 0 END) AS course_level,
      SUM(CASE WHEN con.chapter_id IS NOT NULL THEN 1 ELSE 0 END) AS chapter_level
    FROM consultations con
    JOIN courses c ON c.id = con.course_id
    WHERE c.teacher_id = ?
    ${whereTime}
    `,
    [teacherId, ...timeParams]
  );

  // 4) Top courses by consultations
  const topCourses = await all(
    `
    SELECT
      c.id,
      c.title,
      COUNT(con.id) AS consultations
    FROM courses c
    LEFT JOIN consultations con ON con.course_id = c.id
    WHERE c.teacher_id = ?
    ${from || to ? whereTime.replace(/con\./g, "con.") : ""}
    GROUP BY c.id
    ORDER BY consultations DESC, c.created_at DESC
    LIMIT 10
    `,
    [teacherId, ...timeParams]
  );

  // 5) Top chapters by consultations (only chapter-level ones)
  const topChapters = await all(
    `
    SELECT
      ch.id,
      ch.title,
      ch.course_id,
      c.title AS course_title,
      COUNT(con.id) AS consultations
    FROM chapters ch
    JOIN courses c ON c.id = ch.course_id
    LEFT JOIN consultations con ON con.chapter_id = ch.id
    WHERE c.teacher_id = ?
    ${from || to ? whereTime.replace(/con\./g, "con.") : ""}
    GROUP BY ch.id
    ORDER BY consultations DESC, ch.order_index ASC
    LIMIT 10
    `,
    [teacherId, ...timeParams]
  );

  // 6) Timeline: consultations per day (for teacher's courses)
  const timelineDaily = await all(
    `
    SELECT
      date(con.consulted_at) AS day,
      COUNT(*) AS consultations
    FROM consultations con
    JOIN courses c ON c.id = con.course_id
    WHERE c.teacher_id = ?
    ${whereTime}
    GROUP BY day
    ORDER BY day ASC
    `,
    [teacherId, ...timeParams]
  );

  // 7) Breakdown per course (useful for a bar chart)
  const consultationsPerCourse = await all(
    `
    SELECT
      c.id,
      c.title,
      COUNT(con.id) AS consultations
    FROM courses c
    LEFT JOIN consultations con ON con.course_id = c.id
    WHERE c.teacher_id = ?
    ${from || to ? whereTime.replace(/con\./g, "con.") : ""}
    GROUP BY c.id
    ORDER BY consultations DESC, c.created_at DESC
    `,
    [teacherId, ...timeParams]
  );

  return {
    range: {
      from: from ?? null,
      to: to ?? null,
    },
    totals: {
      courses: Number(coursesRow?.count ?? 0),
      chapters: Number(chaptersRow?.count ?? 0),
      consultations: Number(consultationsRow?.total ?? 0),
      consultationsCourseLevel: Number(consultationsRow?.course_level ?? 0),
      consultationsChapterLevel: Number(consultationsRow?.chapter_level ?? 0),
    },
    topCourses,
    topChapters,
    timelineDaily,
    consultationsPerCourse,
  };
}

module.exports = {
  getTeacherStats,
};
