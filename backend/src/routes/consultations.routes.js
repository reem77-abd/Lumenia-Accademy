import express from "express";
import * as consultationsController from "../controllers/consultations.controller.js";
import auth from "../middlewares/auth.middleware.js";
import requireRole from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * STUDENT: track a course consultation (course-level)
 * POST /api/consultations/course/:courseId
 */
router.post(
  "/course/:courseId",
  auth,
  requireRole("STUDENT"),
  consultationsController.consultCourse
);

router.post(
  "/chapter/:chapterId",
  auth,
  requireRole("STUDENT"),
  consultationsController.consultChapter
);

router.get(
  "/teacher/me",
  auth,
  requireRole("TEACHER"),
  consultationsController.listTeacherConsultations
);

export default router; 
