// src/utils/response.js
export function ok(res, data = null, message = "OK", status = 200, meta = undefined) {
  const payload = { success: true, message, data };
  if (meta !== undefined) payload.meta = meta;
  return res.status(status).json(payload);
}

export function fail(res, message = "Error", status = 400, code = "BAD_REQUEST", details = undefined) {
  const payload = { success: false, error: { message, code } };
  if (details !== undefined) payload.error.details = details;
  return res.status(status).json(payload);
}

// Backwards-compatible helpers used across controllers (many expect `success`/`error`)
export function success(res, status = 200, data = null, message = "OK", meta = undefined) {
  return ok(res, data, message, status, meta);
}

export function error(res, status = 400, message = "Error", code = "BAD_REQUEST", details = undefined) {
  return fail(res, message, status, code, details);
}

// --- IGNORE ---
