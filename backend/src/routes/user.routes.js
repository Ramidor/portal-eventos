const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const enrollmentController = require("../controllers/enrollment.controller");
const ratingController = require("../controllers/rating.controller");
const auth = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/admin.middleware");

/**
 * @swagger
 * tags:
 *   - name: Perfil
 *     description: Datos y acciones del usuario autenticado
 *   - name: Administración
 *     description: Gestión de usuarios (solo administradores)
 */

// ── Perfil propio ─────────────────────────────

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: No autenticado
 */
router.get("/me", auth, userController.getMe);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Actualizar perfil (nombre, email y/o contraseña)
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:            { type: string, example: "Ana García" }
 *               email:           { type: string, format: email }
 *               currentPassword: { type: string, description: "Requerido para cambiar contraseña" }
 *               newPassword:     { type: string, description: "Nueva contraseña (cumple la política de seguridad)" }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user:    { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Contraseña actual incorrecta o nueva contraseña débil
 *       409:
 *         description: El email ya está en uso
 */
router.put("/me", auth, userController.updateMe);

/**
 * @swagger
 * /users/me/events:
 *   get:
 *     summary: Listar eventos organizados por el usuario
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:  { type: integer }
 *                 events: { type: array, items: { $ref: '#/components/schemas/Event' } }
 */
router.get("/me/events", auth, userController.getMyEvents);

/**
 * @swagger
 * /users/me/enrollments:
 *   get:
 *     summary: Listar inscripciones del usuario (con detalle del evento)
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:       { type: integer }
 *                 enrollments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:        { type: integer }
 *                       createdAt: { type: string, format: date-time }
 *                       event:     { $ref: '#/components/schemas/Event' }
 */
router.get("/me/enrollments", auth, enrollmentController.getMyEnrollments);

/**
 * @swagger
 * /users/me/rating-summary:
 *   get:
 *     summary: Resumen de valoraciones recibidas como organizador
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 average: { type: number, nullable: true, example: 4.3, description: "Media redondeada a 1 decimal" }
 *                 total:   { type: integer, example: 12 }
 */
router.get("/me/rating-summary", auth, ratingController.getMyRatingSummary);

// ── Perfil público ────────────────────────────

/**
 * @swagger
 * /users/{id}/public:
 *   get:
 *     summary: Perfil público de un organizador (eventos, valoraciones)
 *     tags: [Perfil]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Perfil público con eventos organizados y valoraciones recibidas
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/:id/public", userController.getPublicProfile);

// ── Rutas ADMIN ───────────────────────────────

/**
 * @swagger
 * /users/admin/users:
 *   get:
 *     summary: "[Admin] Listar todos los usuarios"
 *     tags: [Administración]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total: { type: integer }
 *                 users: { type: array, items: { $ref: '#/components/schemas/User' } }
 *       403:
 *         description: No eres administrador
 */
router.get("/admin/users", auth, requireAdmin, userController.getAllUsers);

/**
 * @swagger
 * /users/admin/users/{id}:
 *   delete:
 *     summary: "[Admin] Eliminar usuario y todos sus eventos"
 *     tags: [Administración]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Usuario eliminado. Se envía notificación por email al afectado. Sus eventos (y sus inscritos) también se eliminan.
 *       400:
 *         description: No puedes eliminarte a ti mismo
 *       404:
 *         description: Usuario no encontrado
 */
router.delete(
  "/admin/users/:id",
  auth,
  requireAdmin,
  userController.deleteUser,
);

/**
 * @swagger
 * /users/admin/users/{id}/role:
 *   patch:
 *     summary: "[Admin] Cambiar rol de un usuario"
 *     tags: [Administración]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user:    { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Rol no válido o intentas cambiar tu propio rol
 */
router.patch(
  "/admin/users/:id/role",
  auth,
  requireAdmin,
  userController.updateUserRole,
);

module.exports = router;
