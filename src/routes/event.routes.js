const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const auth = require("../middlewares/auth.middleware");

// Ruta pública: Cualquiera puede ver los eventos
router.get("/", eventController.getAll);

// Ruta privada: Solo usuarios logueados pueden crear
router.post("/", auth, eventController.create);

module.exports = router;