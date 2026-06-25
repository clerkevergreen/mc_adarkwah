const express = require('express');
const router = express.Router();
const { uploadImage, uploadMultipleImages } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

/**
 * @swagger
 * /api/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Upload a single image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     url: { type: string }
 *                     filename: { type: string }
 */
router.post('/', protect, uploadSingle, uploadImage);

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     tags: [Upload]
 *     summary: Upload multiple images
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
 *     responses:
 *       200:
 *         description: Images uploaded
 */
router.post('/multiple', protect, uploadMultiple, uploadMultipleImages);

module.exports = router;
