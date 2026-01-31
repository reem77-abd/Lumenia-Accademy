import db from "../config/db.js";

function safeJsonParse(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return { raw: str };
  }
}

function toAudit(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    meta: safeJsonParse(row.meta_json),
    createdAt: row.created_at,
  };
}

const AuditLogModel = {
  /**
   * Insert a log row (raw DB operation).
   * Note: business rules (allowed actions, etc.) should live in audit.service.js
   */
  create({ userId = null, action, entityType = null, entityId = null, meta = null }) {
    const metaJson = meta ? JSON.stringify(meta) : null;

    const sql = `
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, meta_json)
      VALUES (?, ?, ?, ?, ?)
    `;

    return (async () => {
      try {
        const info = await runWithRetry(sql, [userId, action, entityType, entityId, metaJson]);
        return { id: info.lastInsertRowid };
      } catch (err) {
        if (err && err.code === 'SQLITE_BUSY') {
          const e = new Error('DATABASE_BUSY');
          e.status = 503;
          throw e;
        }
        throw err;
      }
    })();
  },

  findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM audit_logs WHERE id = ?`, [id], (err, row) => {
        if (err) return reject(err);
        resolve(toAudit(row));
      });
    });
  },

  /**
   * List logs (admin view) with filters + pagination
   */
  list({
    userId,
    action,
    entityType,
    entityId,
    from, // sqlite datetime-compatible string
    to,   // sqlite datetime-compatible string
    limit = 50,
    offset = 0,
    order = "DESC",
  } = {}) {
    return new Promise((resolve, reject) => {
      const where = [];
      const params = [];

      if (userId !== undefined && userId !== null) {
        where.push(`user_id = ?`);
        params.push(userId);
      }
      if (action) {
        where.push(`action = ?`);
        params.push(action);
      }
      if (entityType) {
        where.push(`entity_type = ?`);
        params.push(entityType);
      }
      if (entityId !== undefined && entityId !== null) {
        where.push(`entity_id = ?`);
        params.push(entityId);
      }
      if (from) {
        where.push(`datetime(created_at) >= datetime(?)`);
        params.push(from);
      }
      if (to) {
        where.push(`datetime(created_at) <= datetime(?)`);
        params.push(to);
      }

      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
      const safeOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

      const sql = `
        SELECT *
        FROM audit_logs
        ${whereSql}
        ORDER BY id ${safeOrder}
        LIMIT ? OFFSET ?
      `;

      db.all(sql, [...params, limit, offset], (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(toAudit));
      });
    });
  },
};

export default AuditLogModel;
