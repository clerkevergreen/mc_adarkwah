const express = require('express');
const router = express.Router();
const { subscribe, getSubscribers, deleteSubscriber } = require('../controllers/subscriberController');
const { protect } = require('../middleware/auth');
const { subscribeLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');

/**
 * @swagger
 * /api/subscribers:
 *   post:
 *     tags: [Subscribers]
 *     summary: Subscribe to newsletter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       201:
 *         description: Subscribed successfully
 */
router.post('/', subscribeLimiter, validate.subscriber.create, subscribe);

/**
 * @swagger
 * /api/subscribers:
 *   get:
 *     tags: [Subscribers]
 *     summary: Get all subscribers (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscribers
 */
router.get('/', protect, getSubscribers);

/**
 * @swagger
 * /api/subscribers/{id}:
 *   delete:
 *     tags: [Subscribers]
 *     summary: Delete a subscriber (admin)
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
 *         description: Subscriber deleted
 */
router.delete('/:id', protect, validate.idParam, deleteSubscriber);

module.exports = router;
