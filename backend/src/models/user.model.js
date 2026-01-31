import db from "../config/db.js";

// Helper: retry a db.run operation when SQLITE_BUSY is encountered
async function runWithRetry(sql, params = [], attempts = 5, baseDelay = 20) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({ changes: this.changes, lastInsertRowid: this.lastID });
        });
      });
      return res;
    } catch (err) {
      if (err && err.code === "SQLITE_BUSY" && i < attempts - 1) {
        await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Find user by email
 */
export const findByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;

    db.get(sql, [email], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
};

/**
 * Find user by id
 */
export const findById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, name, email, role, is_active, created_at 
                 FROM users WHERE id = ?`;

    db.get(sql, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
};

/**
 * Create new user
 */
export const create = async ({ name, email, password_hash, role = "STUDENT", is_active = 1 }) => {
  // Ensure role stored in DB matches CHECK constraint (uppercase constants)
  const normalizedRole = typeof role === "string" ? String(role).trim().toUpperCase() : "STUDENT";
  const ALLOWED = new Set(["STUDENT", "TEACHER", "ADMIN"]);
  if (!ALLOWED.has(normalizedRole)) {
    return Promise.reject(Object.assign(new Error("INVALID_ROLE"), { status: 400, details: { allowed: Array.from(ALLOWED) } }));
  }

  const sql = `
    INSERT INTO users (name, email, password_hash, role, is_active)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const info = await runWithRetry(sql, [name, email, password_hash, normalizedRole, is_active]);
    return {
      id: info.lastInsertRowid,
      name,
      email,
      role: normalizedRole,
      is_active,
    };
  } catch (err) {
    if (err && err.code === 'SQLITE_CONSTRAINT') {
      const e = new Error('DB_CONSTRAINT');
      e.status = 400;
      e.details = { message: err.message };
      throw e;
    }
    if (err && err.code === 'SQLITE_BUSY') {
      const e = new Error('DATABASE_BUSY');
      e.status = 503;
      throw e;
    }
    throw err;
  }
};

/**
 * List all users (admin)
 */
export const listUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, name, email, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `;

    db.all(sql, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Activate / Deactivate user
 */
export const setActive = async (id, is_active) => {
  const sql = `UPDATE users SET is_active = ? WHERE id = ?`;
  try {
    const info = await runWithRetry(sql, [is_active, id]);
    return info.changes > 0;
  } catch (err) {
    if (err && err.code === 'SQLITE_BUSY') {
      const e = new Error('DATABASE_BUSY');
      e.status = 503;
      throw e;
    }
    throw err;
  }
};

export default {
  findByEmail,
  findById,
  create,
  listUsers,
  setActive,
};
