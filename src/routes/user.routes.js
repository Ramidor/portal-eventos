const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const enrollmentController = require("../controllers/enrollment.controller");
const auth = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/admin.middleware");

// ── Perfil propio ─────────────────────────────
router.get("/me", auth, userController.getMe);
router.put("/me", auth, userController.updateMe);
router.get("/me/events", auth, userController.getMyEvents);
router.get("/me/enrollments", auth, enrollmentController.getMyEnrollments);

// ── Rutas ADMIN ───────────────────────────────
router.get("/admin/users", auth, requireAdmin, userController.getAllUsers);
router.delete(
  "/admin/users/:id",
  auth,
  requireAdmin,
  userController.deleteUser,
);
router.patch(
  "/admin/users/:id/role",
  auth,
  requireAdmin,
  userController.updateUserRole,
);

module.exports = router;
