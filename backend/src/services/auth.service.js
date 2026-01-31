// backend/src/services/audit.service.js
const AuditLog = require("../models/auditLog.model");

function getReqContext(req) {
  if (!req) return {};
  return {
    ip: req.ip,
    userAgent: req.headers?.["user-agent"] || null,
  };
}

const AUDIT_ACTIONS = Object.freeze({
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  DELETE_ACTION: "DELETE_ACTION",
});

const AUDIT_ENTITIES = Object.freeze({
  COURSE: "COURSE",
  CHAPTER: "CHAPTER",
  ANNOUNCEMENT: "ANNOUNCEMENT",
  USER: "USER",
  CONSULTATION: "CONSULTATION",
});

/**
 * Internal guard: enforce the schema policy:
 * Only these actions should be logged.
 */
function assertAllowedAction(action) {
  const allowed = new Set(Object.values(AUDIT_ACTIONS));
  if (!allowed.has(action)) {
    const err = new Error(`AUDIT_NOT_ALLOWED: ${action}`);
    err.status = 400;
    throw err;
  }
}

async function logLoginSuccess({ req, userId, email }) {
  assertAllowedAction(AUDIT_ACTIONS.LOGIN_SUCCESS);
  const ctx = getReqContext(req);

  return AuditLog.create({
    userId,
    action: AUDIT_ACTIONS.LOGIN_SUCCESS,
    entityType: null,
    entityId: null,
    meta: {
      email: email || null,
      ...ctx,
    },
  });
}

async function logLoginFailed({ req, email, reason }) {
  assertAllowedAction(AUDIT_ACTIONS.LOGIN_FAILED);
  const ctx = getReqContext(req);

  // Per schema comment: NULL user_id for failed login
  return AuditLog.create({
    userId: null,
    action: AUDIT_ACTIONS.LOGIN_FAILED,
    entityType: null,
    entityId: null,
    meta: {
      email: email || null,
      reason: reason || "INVALID_CREDENTIALS",
      ...ctx,
    },
  });
}

async function logDeleteAction({ req, userId, entityType, entityId, meta }) {
  assertAllowedAction(AUDIT_ACTIONS.DELETE_ACTION);
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
 * Optional generic logger (still enforces allowed actions)
 */
async function log({ req, userId = null, action, entityType = null, entityId = null, meta = {} }) {
  assertAllowedAction(action);
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
  log,
};
