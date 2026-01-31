// src/routes/teacherStats.routes.js
const express = require("express");

const teacherStatsController = require("../controllers/teacherStats.controller");
const auth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

const router = express.Router();

/**
 * TEACHER: stats for logged-in teacher
 * GET /api/teacher-stats/me?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
router.get("/me", auth, requireRole("TEACHER"), teacherStatsController.getMyStats);

module.exports = router;
