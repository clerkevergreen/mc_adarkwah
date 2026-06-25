const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get admin dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEvents: { type: integer }
 *                     upcomingEvents: { type: integer }
 *                     pastEvents: { type: integer }
 *                     totalBookings: { type: integer }
 *                     pendingBookings: { type: integer }
 *                     confirmedBookings: { type: integer }
 *                     totalTestimonials: { type: integer }
 *                     approvedTestimonials: { type: integer }
 *                     totalContacts: { type: integer }
 *                     totalSubscribers: { type: integer }
 */
router.get('/', protect, getStats);

module.exports = router;
