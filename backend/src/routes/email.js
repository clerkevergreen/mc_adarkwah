const express = require('express');
const router = express.Router();
const { getLogs, getStats, sendTest } = require('../controllers/emailController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/email/logs:
 *   get:
 *     tags: [Email]
 *     summary: Get email logs (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email logs
 */
router.get('/logs', protect, getLogs);

/**
 * @swagger
 * /api/email/stats:
 *   get:
 *     tags: [Email]
 *     summary: Get email statistics (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email stats
 */
router.get('/stats', protect, getStats);

/**
 * @swagger
 * /api/email/test:
 *   post:
 *     tags: [Email]
 *     summary: Send test email (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test email sent
 */
router.post('/test', protect, sendTest);

module.exports = router;
