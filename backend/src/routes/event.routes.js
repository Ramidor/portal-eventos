const express = require("express");
const router  = express.Router();
const eventController      = require("../controllers/event.controller");
const enrollmentController = require("../controllers/enrollment.controller");
const auth = require("../middlewares/auth.middleware");

// ── Eventos públicos ──────────────────────────
router.get("/",    eventController.getAll);
router.get("/:id", eventController.getOne);

// ── Eventos privados ──────────────────────────
router.post("/",       auth, eventController.create);
router.put("/:id",     auth, eventController.update);
router.delete("/:id",  auth, eventController.remove);

// ── Inscripciones ─────────────────────────────
router.get("/:id/enrollments", auth, enrollmentController.getEnrollments); // ahora requiere auth
router.post("/:id/enroll",     auth, enrollmentController.enroll);
router.delete("/:id/enroll",   auth, enrollmentController.unenroll);

module.exports = router;