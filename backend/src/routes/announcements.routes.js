// src/routes/announcements.routes.js
const express = require("express");

const announcementsController = require("../controllers/announcements.controller");
const auth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

const router = express.Router();

/**
 * Public / Student: list announcements
 * GET /api/announcements?teacherId=
 */
router.get("/", announcementsController.list);

/**
 * Public / Student: announcement details
 * GET /api/announcements/:id
 */
router.get("/:id", announcementsController.getById);

/**
 * Teacher: create announcement
 * POST /api/announcements
 */
router.post("/", auth, requireRole("TEACHER"), announcementsController.create);

/**
 * Teacher: update own announcement
 * PATCH /api/announcements/:id
 */
router.patch("/:id", auth, requireRole("TEACHER"), announcementsController.update);

/**
 * Teacher: delete own announcement
 * DELETE /api/announcements/:id
 */
router.delete("/:id", auth, requireRole("TEACHER"), announcementsController.remove);

module.exports = router;
