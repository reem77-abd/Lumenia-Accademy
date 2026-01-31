import { fail } from "../utils/response.js";

export function errorMiddleware(err, req, res, next) {
  // Accept both `status` and `statusCode` for historical compatibility
  const status = err.status || err.statusCode || err.status_code || 500;
  const code = err.code || (status === 500 ? "INTERNAL_ERROR" : "ERROR");
  const message = err.message || "Something went wrong";

  // Always log full error on server
  console.error(`[${new Date().toISOString()}]`, err);

  // If DB is busy, suggest a retry and add Retry-After header
  if (status === 503) {
    res.setHeader('Retry-After', '3');
  }

  // Control stack trace exposure
  const showStack = process.env.DEBUG_ERRORS === "true";

  const details = showStack
    ? {
        ...(err.details || {}),
        stack: err.stack,
      }
    : err.details;

  return fail(res, message, status, code, details);
}

// --- IGNORE ---
