import * as authService from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    // Basic request validation
    if (!email || !password || !name) {
      const err = new Error("MISSING_FIELDS");
      err.status = 400;
      throw err;
    }

    const result = await authService.register({ name, email, password, role });

    return res.status(201).json({
      success: true,
      data: result, // { token, user }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    return res.status(200).json({
      success: true,
      data: result, // { token, user }
    });
  } catch (err) {
    next(err);
  }
}

// optional: /auth/me
import AuditService from "../services/audit.service.js";

export async function me(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    // Stateless JWT: server can't reliably revoke tokens without a blacklist.
    // Behavior here: record audit and instruct client to discard the token.
    try {
      await AuditService.log({ req, userId: req.user?.id ?? null, action: "LOGOUT" });
    } catch (auditErr) {
      // don't fail logout on audit errors
      console.warn("audit log failed for logout:", auditErr?.message || auditErr);
    }

    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

