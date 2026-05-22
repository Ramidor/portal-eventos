const express = require("express");
const router = express.Router({ mergeParams: true }); // hereda :id de la ruta padre
const messageController = require("../controllers/message.controller");
const auth = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Mensajes
 *   description: Historial de mensajes del muro (los mensajes se crean vía WebSocket)
 */

/**
 * @swagger
 * /events/{id}/messages:
 *   get:
 *     summary: Obtener historial de mensajes de un evento (paginado)
 *     description: |
 *       Devuelve los mensajes del muro del evento en orden cronológico.
 *       Solo accesible para el creador o usuarios inscritos.
 *       Los mensajes **se crean en tiempo real** mediante WebSocket (`emit("sendMessage")`), no por REST.
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del evento
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 100 }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:    { type: integer }
 *                 page:     { type: integer }
 *                 limit:    { type: integer }
 *                 messages: { type: array, items: { $ref: '#/components/schemas/Message' } }
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Debes estar inscrito en el evento para ver el muro
 *       404:
 *         description: Evento no encontrado
 */
router.get("/", auth, messageController.getMessages);

module.exports = router;
