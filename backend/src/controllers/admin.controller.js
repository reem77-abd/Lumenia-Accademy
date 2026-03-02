import userModel from "../models/user.model.js";
import AuditLogModel from "../models/auditLog.model.js";

// admin
export async function listUsers(req, res, next) {
  try {
    const users = await userModel.listUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error("admin listUsers error:", err);
    return next(err);
  }
}

export async function listAuditLogs(req, res, next) {
  try {
    const {
      userId,
      action,
      entityType,
      entityId,
      from,
      to,
      limit,
      offset,
      order,
    } = req.query;

    const logs = await AuditLogModel.list({
      userId: userId !== undefined ? Number(userId) : undefined,
      action: action || undefined,
      entityType: entityType || undefined,
      entityId: entityId !== undefined ? Number(entityId) : undefined,
      from: from || undefined,
      to: to || undefined,
      limit: limit !== undefined ? Math.min(Number(limit), 200) : 50,
      offset: offset !== undefined ? Number(offset) : 0,
      order: order || "DESC",
    });

    return res.json({
      success: true,
      message: "OK",
      data: { logs },
    });
  } catch (err) {
    next(err);
  }
}

export async function activateUser(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, error: { message: "Invalid user id" } });
    }

    const ok = await userModel.setActive(id, 1);
    if (!ok) {
      return res.status(404).json({ success: false, error: { message: "User not found" } });
    }

    return res.status(200).json({ success: true, message: "User activated" });
  } catch (err) {
    console.error("admin activateUser error:", err);
    // Surface DB busy as a 503 so clients can retry
    if (err && err.status === 503) {
      return res.status(503).json({ success: false, error: { message: "Database busy, try again" } });
    }
    return next(err);
  }
}

export async function deactivateUser(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, error: { message: "Invalid user id" } });
    }

    const ok = await userModel.setActive(id, 0);
    if (!ok) {
      return res.status(404).json({ success: false, error: { message: "User not found" } });
    }

    return res.status(200).json({ success: true, message: "User deactivated" });
  } catch (err) {
    console.error("admin deactivateUser error:", err);
    return next(err);
  }
}

export async function updateUser(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, error: { message: "Invalid user id" } });
    }

    const patch = req.body || {};

    // Only allow is_active updates for now (expand later if needed)
    if (!Object.prototype.hasOwnProperty.call(patch, 'is_active')) {
      return res.status(400).json({ success: false, error: { message: "No updatable fields provided" } });
    }

    const value = patch.is_active;
    const isActiveNormalized = value === 1 || value === '1' || value === true || value === 'true' ? 1 : 0;

    const ok = await userModel.setActive(id, isActiveNormalized);
    if (!ok) {
      return res.status(404).json({ success: false, error: { message: "User not found" } });
    }

    const updated = await userModel.findById(id);
    return res.status(200).json({ success: true, data: { user: updated } });
  } catch (err) {
    console.error("admin updateUser error:", err);

    if (err && err.status === 503) {
      return res.status(503).json({ success: false, error: { message: "Database busy, try again" } });
    }

    return next(err);
  }
}

// Provide a default export (router files import controller as default)
export default {
  listUsers,
  activateUser,
  deactivateUser,
  updateUser,
  listAuditLogs,
};
