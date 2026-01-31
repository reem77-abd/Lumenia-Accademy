const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// POST /auth/register
router.post("/register", authController.register);

// POST /auth/login
router.post("/login", authController.login);

// GET /auth/me (protégé)
router.get("/me", authMiddleware, authController.me);

module.exports = router;
