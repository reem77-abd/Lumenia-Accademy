import express from "express";
import * as teacherStatsController from "../controllers/teacherStats.controller.js";
import auth from "../middlewares/auth.middleware.js";
import requireRole from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * TEACHER: stats for logged-in teacher
 * GET /api/teacher-stats/me?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
router.get("/me", auth, requireRole("TEACHER"), teacherStatsController.getMyStats);

export default router;
