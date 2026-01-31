import AuditLog from "../models/auditLog.model.js";

function getReqContext(req) {
  if (!req) return {};
  return {
    ip: req.ip,
    userAgent: req.headers?.["user-agent"] || null,
  };
}

export const AUDIT_ACTIONS = Object.freeze({
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  DELETE_ACTION: "DELETE_ACTION",
});

export const AUDIT_ENTITIES = Object.freeze({
  COURSE: "COURSE",
  CHAPTER: "CHAPTER",
  ANNOUNCEMENT: "ANNOUNCEMENT",
  USER: "USER",
  CONSULTATION: "CONSULTATION",
});

export async function logLoginSuccess({ req, userId, email }) {
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

export async function logLoginFailed({ req, email, reason }) {
  const ctx = getReqContext(req);

  return AuditLog.create({
    userId: null,
    action: AUDIT_ACTIONS.LOGIN_FAILED,
    meta: {
      email: email || null,
      reason: reason || "INVALID_CREDENTIALS",
      ...ctx,
    },
  });
}

export async function logDeleteAction({ req, userId, entityType, entityId, meta }) {
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

export async function log({ req, userId = null, action, entityType = null, entityId = null, meta = {} }) {
  const ctx = getReqContext(req);

  return AuditLog.create({
    userId,
    action,
    entityType,
    entityId,
    meta: { ...ctx, ...(meta || {}) },
  });
}

export default {
  AUDIT_ACTIONS,
  AUDIT_ENTITIES,
  logLoginSuccess,
  logLoginFailed,
  logDeleteAction,
  log,
};
