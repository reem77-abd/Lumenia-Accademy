export default function roleMiddleware(...allowedRoles) {
  // Normalize allowed roles once (accept friendly aliases and case-insensitive checks)
  const normalizedAllowed = allowedRoles.map(r => String(r).trim().toUpperCase());

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: no role found",
      });
    }

    const userRole = String(req.user.role).trim().toUpperCase();

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};
