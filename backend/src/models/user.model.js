const db = require("../config/db");

/**
 * Find user by email
 */
const findByEmail = (email) => {
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
const findById = (id) => {
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
const create = ({ name, email, password_hash, role = "student", is_active = 1 }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [name, email, password_hash, role, is_active], function (err) {
      if (err) return reject(err);

      resolve({
        id: this.lastID,
        name,
        email,
        role,
        is_active,
      });
    });
  });
};

/**
 * List all users (admin)
 */
const listUsers = () => {
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
const setActive = (id, is_active) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE users SET is_active = ? WHERE id = ?`;

    db.run(sql, [is_active, id], function (err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
};

module.exports = {
  findByEmail,
  findById,
  create,
  listUsers,
  setActive,
};
