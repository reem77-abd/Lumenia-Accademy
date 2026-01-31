import chapterModel from '../src/models/chapter.model.js';
import courseModel from '../src/models/course.model.js';

(async function run() {
  try {
    const courses = await courseModel.listCourses({});
    console.log('COURSES_COUNT:', Array.isArray(courses) ? courses.length : typeof courses);
    console.log('COURSES_SAMPLE:', JSON.stringify((courses || []).slice(0,5), null, 2));

    const owner = await chapterModel.getCourseOwnerId(1);
    console.log('OWNER_ID_FOR_course_1 ->', owner);

    const chapters = await chapterModel.listByCourse(1);
    console.log('CHAPTERS_FOR_course_1_LEN ->', Array.isArray(chapters) ? chapters.length : typeof chapters);
    console.log('CHAPTERS_SAMPLE ->', JSON.stringify((chapters || []).slice(0,5), null, 2));

    // direct raw queries via the DB connection (if available)
    try {
      const db = (await import('../src/config/db.js')).default;
      const get = (sql, params=[]) => new Promise((res, rej) => db.get(sql, params, (e, r) => e ? rej(e) : res(r)));
      const all = (sql, params=[]) => new Promise((res, rej) => db.all(sql, params, (e, r) => e ? rej(e) : res(r)));
      console.log('PRAGMA journal_mode ->', await get('PRAGMA journal_mode'));
      console.log('PRAGMA foreign_keys ->', await get('PRAGMA foreign_keys'));
      console.log('PRAGMA busy_timeout ->', await get('PRAGMA busy_timeout'));
      console.log('COURSES TABLE INFO ->', await all("PRAGMA table_info('courses')"));
      console.log('CHAPTERS TABLE INFO ->', await all("PRAGMA table_info('chapters')"));
      console.log('RAW course row ->', await get('SELECT * FROM courses WHERE id = ?', [1]));
      console.log('RAW chapters rows ->', await all('SELECT * FROM chapters WHERE course_id = ? ORDER BY id', [1]));
    } catch (e) {
      console.warn('raw-DB-check failed:', e && e.message);
    }

    process.exit(0);
  } catch (err) {
    console.error('FATAL', err && err.stack || err);
    process.exit(1);
  }
})();
