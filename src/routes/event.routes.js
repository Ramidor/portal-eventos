const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const auth = require("../middlewares/auth.middleware");

// Ruta pública: Cualquiera puede ver los eventos
router.get("/", eventController.getAll);
router.get("/:id", eventController.getOne);

// Ruta privada: Solo usuarios logueados pueden crear, actualizar y eliminar eventos
router.post("/", auth, eventController.create);
router.put("/:id", auth, eventController.update);
router.delete("/:id", auth, eventController.remove);

// ── Inscripciones anidadas bajo /events/:id ───
router.get("/:id/enrollments", enrollmentController.getEnrollments); // Pública
router.post("/:id/enroll", auth, enrollmentController.enroll); // Privada
router.delete("/:id/enroll", auth, enrollmentController.unenroll); // Privada

module.exports = router;
