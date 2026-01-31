const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// 🔒 Protect ALL admin routes
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// ✅ GET /admin/users  (list users)
router.get("/users", adminController.listUsers);

// ✅ PATCH /admin/users/:id/activate  (activate user)
router.patch("/users/:id/activate", adminController.activateUser);

// ✅ PATCH /admin/users/:id/deactivate  (deactivate user)
router.patch("/users/:id/deactivate", adminController.deactivateUser);

module.exports = router;
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// Protection globale (toutes les routes admin)
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// GET /admin/users
router.get("/users", adminController.listUsers);

// PATCH /admin/users/:id/activate
router.patch("/users/:id/activate", adminController.activateUser);

// PATCH /admin/users/:id/deactivate
router.patch("/users/:id/deactivate", adminController.deactivateUser);

module.exports = router;
