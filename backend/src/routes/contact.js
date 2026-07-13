const express = require('express');
const router = express.Router();
const { createMessage, getMessages, deleteMessage } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * /api/contact:
 *   post:
 *     tags: [Contact]
 *     summary: Send a contact message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               subject: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/', validate.contact.create, createMessage);

/**
 * @swagger
 * /api/contact:
 *   get:
 *     tags: [Contact]
 *     summary: Get all messages (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/', protect, getMessages);

/**
 * @swagger
 * /api/contact/{id}:
 *   delete:
 *     tags: [Contact]
 *     summary: Delete a contact message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete('/:id', protect, validate.idParam, deleteMessage);

module.exports = router;
