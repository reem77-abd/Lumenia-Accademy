// src/routes/consultations.routes.js
const express = require("express");

const consultationsController = require("../controllers/consultations.controller");
const auth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

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

/**
 * STUDENT: track a chapter consultation (chapter-level)
 * POST /api/consultations/chapter/:chapterId
 */
router.post(
  "/chapter/:chapterId",
  auth,
  requireRole("STUDENT"),
  consultationsController.consultChapter
);

/**
 * TEACHER: see consultations for my courses
 * GET /api/consultations/teacher/me
 */
router.get(
  "/teacher/me",
  auth,
  requireRole("TEACHER"),
  consultationsController.listTeacherConsultations
);

module.exports = router;
