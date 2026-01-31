// src/routes/courses.routes.js
const express = require("express");

const coursesController = require("../controllers/courses.controller");
const auth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

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

module.exports = router;
