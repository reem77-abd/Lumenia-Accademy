import express from "express";
import * as authController from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /auth/register
router.post("/register", authController.register);

// POST /auth/login
router.post("/login", authController.login);

// GET /auth/me (protected)
router.get("/me", authMiddleware, authController.me);

// POST /auth/logout (protected) — client should discard token; server records audit
router.post("/logout", authMiddleware, authController.logout);

export default router; 
