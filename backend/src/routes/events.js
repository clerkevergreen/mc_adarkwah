const express = require('express');
const router = express.Router();
const {
  getEvents, getEventBySlug, createEvent, updateEvent, deleteEvent, toggleFeature,
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         title: { type: string }
 *         slug: { type: string }
 *         description: { type: string }
 *         date: { type: string, format: date-time }
 *         endDate: { type: string, format: date-time }
 *         time: { type: string }
 *         location: { type: string }
 *         city: { type: string }
 *         category: { type: string, enum: [corporate, private, charity, conference, wedding, other] }
 *         image: { type: string }
 *         images: { type: array, items: { type: string } }
 *         attendeeCount: { type: number }
 *         isUpcoming: { type: boolean }
 *         isFeatured: { type: boolean }
 *         highlights: { type: array, items: { type: string } }
 *         testimonials: { type: array, items: { type: string } }
 *         createdAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     tags: [Events]
 *     summary: Get all events
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: isUpcoming
 *         schema: { type: boolean }
 *       - in: query
 *         name: isFeatured
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Event' } }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     pages: { type: integer }
 */
router.get('/', getEvents);

/**
 * @swagger
 * /api/events/{slug}:
 *   get:
 *     tags: [Events]
 *     summary: Get event by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Event' }
 */
router.get('/:slug', getEventBySlug);

/**
 * @swagger
 * /api/events:
 *   post:
 *     tags: [Events]
 *     summary: Create a new event
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created
 */
router.post('/', protect, validate.event.create, createEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     tags: [Events]
 *     summary: Update an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated
 */
router.put('/:id', protect, validate.event.update, updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     tags: [Events]
 *     summary: Delete an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.delete('/:id', protect, validate.idParam, deleteEvent);

/**
 * @swagger
 * /api/events/{id}/toggle-feature:
 *   patch:
 *     tags: [Events]
 *     summary: Toggle featured status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Featured status toggled
 */
router.patch('/:id/toggle-feature', protect, validate.event.toggleFeature, toggleFeature);

module.exports = router;
