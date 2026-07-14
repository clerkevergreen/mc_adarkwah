const express = require('express');
const router = express.Router();
const { getAvailability, blockDates, unblockDate, getAllBlocks, syncBookings } = require('../controllers/availabilityController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * /api/availability:
 *   get:
 *     tags: [Availability]
 *     summary: Get availability for a date range
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Availability records
 */
router.get('/', getAvailability);

/**
 * @swagger
 * /api/availability/admin:
 *   get:
 *     tags: [Availability]
 *     summary: Get all blocked/booked dates (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of blocked dates
 */
router.get('/admin', protect, getAllBlocks);

/**
 * @swagger
 * /api/availability/block:
 *   post:
 *     tags: [Availability]
 *     summary: Block specific dates (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dates: { type: array, items: { type: string, format: date } }
 *               reason: { type: string }
 *     responses:
 *       201:
 *         description: Dates blocked
 */
router.post('/block', protect, validate.availability.block, blockDates);

/**
 * @swagger
 * /api/availability/{id}:
 *   delete:
 *     tags: [Availability]
 *     summary: Unblock a date (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Date unblocked
 */
router.delete('/:id', protect, validate.idParam, unblockDate);

/**
 * @swagger
 * /api/availability/sync:
 *   post:
 *     tags: [Availability]
 *     summary: Sync confirmed/pending bookings into availability (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings synced
 */
router.post('/sync', protect, syncBookings);

module.exports = router;
