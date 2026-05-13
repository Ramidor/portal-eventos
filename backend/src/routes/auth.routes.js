const express = require("express");
const router  = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/register",            authController.register);
router.post("/login",               authController.login);
router.post("/verify-email",        authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);

module.exports = router;