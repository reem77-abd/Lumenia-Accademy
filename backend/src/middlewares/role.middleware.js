module.exports = function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    // Sécurité : auth.middleware doit être passé avant
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: no role found",
      });
    }

    const userRole = req.user.role;

    // Vérifier si le rôle est autorisé
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    // Rôle OK → continuer
    next();
  };
};
