import express from "express";
import * as chaptersController from "../controllers/chapters.controller.js";
import auth from "../middlewares/auth.middleware.js";
import requireRole from "../middlewares/role.middleware.js";

const router = express.Router();

// Public: list chapters of a course
// Support both: GET /api/chapters?courseId=1 and GET /api/chapters/course/:courseId
router.get("/", chaptersController.listByCourse);
router.get("/course/:courseId", chaptersController.listByCourse);

// Public: chapter details
router.get("/:id", chaptersController.getById);

// Teacher only: add chapter to a course (must own the course)
// Support both: POST /api/chapters (course_id in body) and POST /api/chapters/course/:courseId
router.post(
  "/",
  auth,
  requireRole("TEACHER"),
  chaptersController.create
);

router.post(
  "/course/:courseId",
  auth,
  requireRole("TEACHER"),
  chaptersController.create
);

// Teacher only: update chapter (must own the course)
router.patch("/:id", auth, requireRole("TEACHER"), chaptersController.update);

// Teacher only: delete chapter (must own the course)
router.delete("/:id", auth, requireRole("TEACHER"), chaptersController.remove);

export default router;
