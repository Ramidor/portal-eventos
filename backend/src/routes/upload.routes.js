const express  = require("express");
const router   = express.Router();
const auth           = require("../middlewares/auth.middleware");
const upload         = require("../middlewares/upload.middleware");
const { uploadLimiter } = require("../middlewares/rateLimiter.middleware");
const uploadController  = require("../controllers/upload.controller");

/**
 * @swagger
 * tags:
 *   name: Imágenes
 *   description: Subida de imágenes a Cloudinary
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Subir imágenes a Cloudinary
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Hasta 5 imágenes. Formatos: JPEG, PNG, WebP, GIF. Tamaño máximo: 5 MB por imagen."
 *     responses:
 *       200:
 *         description: URLs de las imágenes subidas a Cloudinary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uri
 *                   example: ["https://res.cloudinary.com/demo/image/upload/v1/portal-eventos/abc123.jpg"]
 *       400:
 *         description: No se enviaron imágenes o se superó el límite de 5
 *       401:
 *         description: No autenticado
 *       429:
 *         description: Demasiadas subidas (límite 20 por 15 minutos)
 */
router.post("/", auth, uploadLimiter, upload.array("images", 5), uploadController.uploadImages);

module.exports = router;
