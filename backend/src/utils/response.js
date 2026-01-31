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

// --- IGNORE ---
