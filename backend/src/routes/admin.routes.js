import express from "express";
import adminController from "../controllers/admin.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// 🔒 Protect ALL admin routes
router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

// ✅ GET /admin/users  (list users)
router.get("/users", adminController.listUsers);

// ✅ PATCH /admin/users/:id  (partial update — accepts { is_active })
router.patch("/users/:id", adminController.updateUser);

// ✅ PATCH /admin/users/:id/activate  (activate user)
router.patch("/users/:id/activate", adminController.activateUser);

// ✅ PATCH /admin/users/:id/deactivate  (deactivate user)
router.patch("/users/:id/deactivate", adminController.deactivateUser);

export default router;
