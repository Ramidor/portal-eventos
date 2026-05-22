const express = require("express");
const router  = express.Router();
const eventController      = require("../controllers/event.controller");
const enrollmentController = require("../controllers/enrollment.controller");
const ratingController     = require("../controllers/rating.controller");
const auth         = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/admin.middleware");

/**
 * @swagger
 * tags:
 *   - name: Eventos
 *     description: CRUD de eventos
 *   - name: Inscripciones
 *     description: Gestión de inscripciones a eventos
 *   - name: Valoraciones
 *     description: Valoraciones de eventos pasados
 */

// ── Admin ─────────────────────────────────────

/**
 * @swagger
 * /events/admin/all:
 *   get:
 *     summary: "[Admin] Listar todos los eventos (incluidos pasados)"
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de eventos sin filtro de fecha
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:  { type: integer }
 *                 events: { type: array, items: { $ref: '#/components/schemas/Event' } }
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: El usuario no es administrador
 */
router.get("/admin/all", auth, requireAdmin, eventController.adminGetAll);

// ── Eventos públicos ──────────────────────────

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Listar eventos futuros (paginado)
 *     tags: [Eventos]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [MUSICA,DEPORTE,ARTE,TECNOLOGIA,GASTRONOMIA,EDUCACION,NEGOCIOS,OTRO]
 *         description: Filtrar por categoría
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *         description: Filtrar por ciudad (búsqueda parcial, insensible a mayúsculas)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Búsqueda por título o ubicación
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 50 }
 *     responses:
 *       200:
 *         description: Listado paginado de eventos futuros ordenados por fecha
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PaginatedEvents' }
 */
router.get("/", eventController.getAll);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Obtener detalle de un evento
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Evento con creador y número de inscritos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
 *       404:
 *         description: Evento no encontrado
 */
router.get("/:id", eventController.getOne);

// ── Eventos privados ──────────────────────────

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Crear un nuevo evento
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, date, location]
 *             properties:
 *               title:        { type: string, example: "Festival de Jazz" }
 *               description:  { type: string, example: "Una tarde mágica..." }
 *               date:         { type: string, format: date-time, description: "Debe ser futura (mínimo 30 min)" }
 *               location:     { type: string, example: "Parque del Retiro, Madrid" }
 *               latitude:     { type: number, example: 40.4153 }
 *               longitude:    { type: number, example: -3.6844 }
 *               images:       { type: array, items: { type: string, format: uri } }
 *               category:     { type: string, enum: [MUSICA,DEPORTE,ARTE,TECNOLOGIA,GASTRONOMIA,EDUCACION,NEGOCIOS,OTRO] }
 *               maxAttendees: { type: integer, minimum: 1, nullable: true, example: 100 }
 *     responses:
 *       201:
 *         description: Evento creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 event:   { $ref: '#/components/schemas/Event' }
 *       400:
 *         description: Campos inválidos o fecha pasada
 *       401:
 *         description: No autenticado
 */
router.post("/", auth, eventController.create);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Actualizar un evento (solo el creador)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       description: Todos los campos son opcionales; solo se actualiza lo que se envíe
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:        { type: string }
 *               description:  { type: string }
 *               date:         { type: string, format: date-time }
 *               location:     { type: string }
 *               latitude:     { type: number }
 *               longitude:    { type: number }
 *               images:       { type: array, items: { type: string, format: uri } }
 *               category:     { type: string }
 *               maxAttendees: { type: integer, nullable: true }
 *     responses:
 *       200:
 *         description: Evento actualizado. Se notifica por email a los inscritos si cambia título, fecha o lugar.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 event:   { $ref: '#/components/schemas/Event' }
 *       400:
 *         description: Validación fallida (p.ej. aforo < inscritos actuales)
 *       403:
 *         description: No eres el creador del evento
 *       404:
 *         description: Evento no encontrado
 */
router.put("/:id", auth, eventController.update);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Eliminar un evento (creador o admin)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Evento eliminado. Se notifica a inscritos y (si es admin) al creador. Las imágenes se eliminan de Cloudinary.
 *       403:
 *         description: Sin permiso para eliminar este evento
 *       404:
 *         description: Evento no encontrado
 */
router.delete("/:id", auth, eventController.remove);

// ── Inscripciones ─────────────────────────────

/**
 * @swagger
 * /events/{id}/enrollments/me:
 *   get:
 *     summary: Comprobar si el usuario actual está inscrito
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isEnrolled: { type: boolean, example: true }
 */
router.get("/:id/enrollments/me", auth, enrollmentController.getMyEnrollmentStatus);

/**
 * @swagger
 * /events/{id}/enrollments:
 *   get:
 *     summary: Listar inscritos de un evento (solo el creador)
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:       { type: integer }
 *                 enrollments: { type: array, items: { $ref: '#/components/schemas/Enrollment' } }
 *       403:
 *         description: Solo el creador puede ver la lista completa de inscritos
 */
router.get("/:id/enrollments", auth, enrollmentController.getEnrollments);

/**
 * @swagger
 * /events/{id}/enroll:
 *   post:
 *     summary: Inscribirse en un evento
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201:
 *         description: Inscripción realizada
 *       400:
 *         description: Aforo completo o eres el creador del evento
 *       409:
 *         description: Ya estás inscrito en este evento
 */
router.post("/:id/enroll", auth, enrollmentController.enroll);

/**
 * @swagger
 * /events/{id}/enroll:
 *   delete:
 *     summary: Cancelar inscripción en un evento
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Inscripción cancelada
 *       404:
 *         description: No estás inscrito en este evento
 */
router.delete("/:id/enroll", auth, enrollmentController.unenroll);

// ── Valoraciones ──────────────────────────────

/**
 * @swagger
 * /events/{id}/ratings/me:
 *   get:
 *     summary: Obtener mi valoración para un evento
 *     tags: [Valoraciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rating:
 *                   oneOf:
 *                     - { $ref: '#/components/schemas/Rating' }
 *                     - { type: "null" }
 */
router.get("/:id/ratings/me", auth, ratingController.getMyRating);

/**
 * @swagger
 * /events/{id}/ratings:
 *   get:
 *     summary: Listar valoraciones de un evento (público)
 *     tags: [Valoraciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:   { type: integer }
 *                 average: { type: number, nullable: true, example: 4.2 }
 *                 ratings: { type: array, items: { $ref: '#/components/schemas/Rating' } }
 */
router.get("/:id/ratings", ratingController.getEventRatings);

/**
 * @swagger
 * /events/{id}/ratings:
 *   post:
 *     summary: Crear o actualizar valoración (solo inscritos en eventos pasados)
 *     tags: [Valoraciones]
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
 *             required: [score]
 *             properties:
 *               score:   { type: integer, minimum: 1, maximum: 5, example: 4 }
 *               comment: { type: string, nullable: true, example: "Muy bien organizado" }
 *     responses:
 *       201:
 *         description: Valoración guardada (crea o actualiza la existente)
 *       400:
 *         description: El evento aún no ha terminado
 *       403:
 *         description: No eres inscrito o eres el creador
 */
router.post("/:id/ratings", auth, ratingController.submitRating);

module.exports = router;
