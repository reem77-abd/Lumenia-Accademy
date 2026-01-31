import userModel from "../models/user.model.js";
import AuditService from "./audit.service.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";

export async function register({ name, email, password, role }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error("USER_ALREADY_EXISTS");
    err.status = 400;
    throw err;
  }

  // Normalize and validate role (accept common casings/aliases in dev)
  const ALLOWED = new Set(["STUDENT", "TEACHER", "ADMIN"]);
  let normalizedRole = (typeof role === "string" ? role.trim().toUpperCase() : "STUDENT");

  // Accept a few friendly aliases (e.g. 'student' or 'Student') by normalization above
  if (!ALLOWED.has(normalizedRole)) {
    const err = new Error("INVALID_ROLE");
    err.status = 400;
    err.details = { allowed: Array.from(ALLOWED) };
    throw err;
  }

  const password_hash = await hashPassword(password);

  let user;
  try {
    user = await userModel.create({ name, email, password_hash, role: normalizedRole });
  } catch (dbErr) {
    // Translate common SQLite constraint errors into friendly HTTP errors
    if (dbErr && dbErr.code === "SQLITE_CONSTRAINT") {
      const err = new Error("INVALID_PAYLOAD");
      err.status = 400;
      err.details = { message: dbErr.message };
      throw err;
    }
    throw dbErr;
  }

  const token = signToken({ sub: user.id, role: user.role });

  // best-effort audit (do not block registration on audit failure)
  try {
    await AuditService.logLoginSuccess({ req: null, userId: user.id, email: user.email });
  } catch (e) {
    // noop
  }

  return { token, user };
}

export async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user) {
    try {
      await AuditService.logLoginFailed({ req: null, email, reason: "NOT_FOUND" });
    } catch (e) {}
    const err = new Error("INVALID_CREDENTIALS");
    err.status = 401;
    throw err;
  }

  // Development convenience: support placeholder hashes (e.g. "HASH_TEACHER") that
  // exist in the provided sqlite seed. This is ONLY allowed when not in production.
  let ok = false;
  const isPlaceholder = typeof user.password_hash === "string" && user.password_hash.startsWith("HASH_");

  if (process.env.NODE_ENV !== "production" && isPlaceholder) {
    // Accept either the literal placeholder (what you tried in Postman) or the suffix
    // (e.g. `HASH_TEACHER` -> allow `TEACHER`) or a DEV_MASTER_PASSWORD override.
    const suffix = user.password_hash.slice(5);
    ok = password === user.password_hash || password === suffix || (process.env.DEV_MASTER_PASSWORD && password === process.env.DEV_MASTER_PASSWORD);

    if (ok) {
      // best-effort audit for dev-path success
      try {
        await AuditService.logLoginSuccess({ req: null, userId: user.id, email });
      } catch (e) {}
    }
  } else {
    ok = await comparePassword(password, user.password_hash);
  }

  if (!ok) {
    try {
      await AuditService.logLoginFailed({ req: null, email, reason: "INVALID_PASSWORD" });
    } catch (e) {}
    const err = new Error("INVALID_CREDENTIALS");
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error("USER_INACTIVE");
    err.status = 403;
    throw err;
  }

  const token = signToken({ sub: user.id, role: user.role });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export default { register, login };
