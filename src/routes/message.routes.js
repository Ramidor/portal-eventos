const express = require("express");
const router = express.Router({ mergeParams: true }); // hereda :id de event.routes
const messageController = require("../controllers/message.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, messageController.getMessages);

module.exports = router;
