const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

module.exports = async function authMiddleware(req, res, next) {
  try {
    // 1) Vérifier le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // 2) Vérifier le format Bearer <token>
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const token = parts[1];

    // 3) Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { sub, role, iat, exp }
    const userId = decoded.sub;

    // 4) Recharger le user depuis la DB
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 5) Bloquer si user désactivé
    if (!user.is_active) {
      return res.status(401).json({ message: "User account is deactivated" });
    }

    // 6) Attacher l'utilisateur à la requête
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
