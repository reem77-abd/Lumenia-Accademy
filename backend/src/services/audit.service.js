// backend/src/services/audit.service.js
const AuditLog = require("../models/auditLog.model");

/**
 * Extracts request context (IP + user-agent) safely.
 */
function getReqContext(req) {
  if (!req) return {};
  return {
    ip: req.ip,
    userAgent: req.headers?.["user-agent"] || null,
  };
}

/**
 * Keep audit actions consistent across the app.
 */
const AUDIT_ACTIONS = Object.freeze({
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  DELETE_ACTION: "DELETE_ACTION",
});

/**
 * Keep entity types consistent across the app.
 * Add more when needed (ANNOUNCEMENT etc).
 */
const AUDIT_ENTITIES = Object.freeze({
  COURSE: "COURSE",
  CHAPTER: "CHAPTER",
  ANNOUNCEMENT: "ANNOUNCEMENT",
  USER: "USER",
  CONSULTATION: "CONSULTATION",
});

async function logLoginSuccess({ req, userId, email }) {
  const ctx = getReqContext(req);

  return AuditLog.create({
    userId,
    action: AUDIT_ACTIONS.LOGIN_SUCCESS,
    meta: {
      email: email || null,
      ...ctx,
    },
  });
}

async function logLoginFailed({ req, email, reason }) {
  const ctx = getReqContext(req);

  return AuditLog.create({
    userId: null, // per schema: NULL for unknown user in failed login
    action: AUDIT_ACTIONS.LOGIN_FAILED,
    meta: {
      email: email || null,
      reason: reason || "INVALID_CREDENTIALS",
      ...ctx,
    },
  });
}

/**
 * Logs a DELETE action.
 * entityType examples: 'COURSE', 'CHAPTER', 'ANNOUNCEMENT', 'USER'
 */
async function logDeleteAction({ req, userId, entityType, entityId, meta }) {
  const ctx = getReqContext(req);

  return AuditLog.create({
    userId,
    action: AUDIT_ACTIONS.DELETE_ACTION,
    entityType: entityType || null,
    entityId: entityId ?? null,
    meta: {
      ...ctx,
      ...(meta || {}),
    },
  });
}

/**
 * Optional generic method (if you ever want to audit more actions later).
 */
async function log({ req, userId = null, action, entityType = null, entityId = null, meta = {} }) {
  const ctx = getReqContext(req);

  return AuditLog.create({
    userId,
    action,
    entityType,
    entityId,
    meta: { ...ctx, ...(meta || {}) },
  });
}

module.exports = {
  AUDIT_ACTIONS,
  AUDIT_ENTITIES,
  logLoginSuccess,
  logLoginFailed,
  logDeleteAction,
  log, // optional
};
