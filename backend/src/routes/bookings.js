const express = require('express');
const router = express.Router();
const { createBooking, getBookings, updateStatus, deleteBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Submit a booking request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               eventType: { type: string }
 *               eventDate: { type: string, format: date }
 *               guestCount: { type: number }
 *               location: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post('/', validate.booking.create, createBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get all bookings (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, cancelled, completed] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/', protect, getBookings);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     tags: [Bookings]
 *     summary: Update booking status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking status updated
 */
router.patch('/:id/status', protect, validate.booking.statusUpdate, updateStatus);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     tags: [Bookings]
 *     summary: Delete a booking
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking deleted
 */
router.delete('/:id', protect, validate.idParam, deleteBooking);

module.exports = router;
