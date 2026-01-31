import { fail } from "../utils/response.js";

export function errorMiddleware(err, req, res, next) {
  const status = err.status || 500;
  const code =
    err.code || (status === 500 ? "INTERNAL_ERROR" : "ERROR");
  const message = err.message || "Something went wrong";

  // Always log full error on server
  console.error(`[${new Date().toISOString()}]`, err);

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
