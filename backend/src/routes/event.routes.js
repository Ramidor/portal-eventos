const express = require("express");
const router  = express.Router();
const eventController      = require("../controllers/event.controller");
const enrollmentController = require("../controllers/enrollment.controller");
const ratingController     = require("../controllers/rating.controller");
const auth         = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/admin.middleware");

// ── Admin ─────────────────────────────────────
router.get("/admin/all", auth, requireAdmin, eventController.adminGetAll);

// ── Eventos públicos ──────────────────────────
router.get("/",    eventController.getAll);
router.get("/:id", eventController.getOne);

// ── Eventos privados ──────────────────────────
router.post("/",       auth, eventController.create);
router.put("/:id",     auth, eventController.update);
router.delete("/:id",  auth, eventController.remove);

// ── Inscripciones ─────────────────────────────
router.get("/:id/enrollments/me", auth, enrollmentController.getMyEnrollmentStatus);
router.get("/:id/enrollments",    auth, enrollmentController.getEnrollments);
router.post("/:id/enroll",        auth, enrollmentController.enroll);
router.delete("/:id/enroll",      auth, enrollmentController.unenroll);

// ── Valoraciones ──────────────────────────────
router.get("/:id/ratings/me", auth, ratingController.getMyRating);
router.get("/:id/ratings",         ratingController.getEventRatings);
router.post("/:id/ratings",   auth, ratingController.submitRating);

module.exports = router;