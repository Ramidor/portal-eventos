const express = require("express");
const router  = express.Router();
const authController = require("../controllers/auth.controller");

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Registro, login y verificación de email
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ana García
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ana@test.com
 *               password:
 *                 type: string
 *                 description: "Mínimo 8 caracteres, una mayúscula, un número y un símbolo"
 *                 example: Test1234!
 *     responses:
 *       201:
 *         description: Código OTP enviado al email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Código enviado. Revisa tu email." }
 *       400:
 *         description: Datos inválidos o contraseña débil
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Email ya registrado y verificado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ana@test.com
 *               password:
 *                 type: string
 *                 example: Test1234!
 *     responses:
 *       200:
 *         description: Login exitoso — devuelve JWT y datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string, description: JWT válido por 1 hora }
 *                 user:  { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Email no verificado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string }
 *                 code:  { type: string, example: EMAIL_NOT_VERIFIED }
 *       429:
 *         description: Demasiados intentos (rate limit 15 req / 15 min)
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verificar email con el código OTP
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ana@test.com
 *               code:
 *                 type: string
 *                 description: Código de 6 dígitos recibido por email
 *                 example: "482931"
 *     responses:
 *       200:
 *         description: Email verificado — devuelve JWT y datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 token:   { type: string }
 *                 user:    { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Código incorrecto o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string }
 *                 code:  { type: string, example: CODE_EXPIRED }
 */
router.post("/verify-email", authController.verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Reenviar código de verificación
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ana@test.com
 *     responses:
 *       200:
 *         description: Respuesta genérica (no revela si el email existe)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.post("/resend-verification", authController.resendVerification);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ana@test.com
 *     responses:
 *       200:
 *         description: Respuesta genérica (no revela si el email existe). Si es válido, se envía un enlace con token válido 1 hora.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con el token del email
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token recibido en el email (válido 1 hora)
 *               password:
 *                 type: string
 *                 description: "Nueva contraseña (mínimo 8 caracteres, mayúscula, número, símbolo)"
 *                 example: NuevaClave1!
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Token inválido, expirado o contraseña débil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string }
 *                 code:  { type: string, example: TOKEN_EXPIRED }
 */
router.post("/reset-password", authController.resetPassword);

module.exports = router;
