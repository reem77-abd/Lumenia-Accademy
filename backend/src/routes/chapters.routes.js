// src/routes/chapters.routes.js
const express = require("express");

const chaptersController = require("../controllers/chapters.controller");
const auth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

const router = express.Router();

// Public: list chapters of a course
router.get("/course/:courseId", chaptersController.listByCourse);

// Public: chapter details
router.get("/:id", chaptersController.getById);

// Teacher only: add chapter to a course (must own the course)
router.post(
  "/course/:courseId",
  auth,
  requireRole("TEACHER"),
  chaptersController.create
);

// Teacher only: update chapter (must own course of this chapter)
router.patch("/:id", auth, requireRole("TEACHER"), chaptersController.update);

// Teacher only: delete chapter (must own course of this chapter)
router.delete("/:id", auth, requireRole("TEACHER"), chaptersController.remove);

module.exports = router;
