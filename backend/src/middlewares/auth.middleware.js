import { verifyToken } from "../utils/jwt.js";
import userModel from "../models/user.model.js";

export default async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const token = parts[1];

    const decoded = verifyToken(token);
    const userId = decoded.sub;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: "User account is deactivated" });
    }

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
