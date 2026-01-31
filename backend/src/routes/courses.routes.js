import express from "express";
import * as coursesController from "../controllers/courses.controller.js";
import auth from "../middlewares/auth.middleware.js";
import requireRole from "../middlewares/role.middleware.js";

const router = express.Router();

// Public: list courses
router.get("/", coursesController.listCourses);

// Public: course details
router.get("/:id", coursesController.getCourseById);

// Teacher only: create course
router.post("/", auth, requireRole("TEACHER"), coursesController.createCourse);

// Teacher only: update course
router.patch("/:id", auth, requireRole("TEACHER"), coursesController.updateCourse);

// Teacher only: delete course
router.delete("/:id", auth, requireRole("TEACHER"), coursesController.deleteCourse);

export default router; 
