const express = require('express');
const router = express.Router();
const { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, approveTestimonial } = require('../controllers/testimonialController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/testimonials:
 *   get:
 *     tags: [Testimonials]
 *     summary: Get approved testimonials
 *     parameters:
 *       - in: query
 *         name: approved
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: List of testimonials
 */
router.get('/', getTestimonials);

/**
 * @swagger
 * /api/testimonials:
 *   post:
 *     tags: [Testimonials]
 *     summary: Submit a testimonial
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               role: { type: string }
 *               content: { type: string }
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *     responses:
 *       201:
 *         description: Testimonial submitted
 */
router.post('/', createTestimonial);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   put:
 *     tags: [Testimonials]
 *     summary: Update a testimonial
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Testimonial updated
 */
router.put('/:id', protect, updateTestimonial);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   delete:
 *     tags: [Testimonials]
 *     summary: Delete a testimonial
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Testimonial deleted
 */
router.delete('/:id', protect, deleteTestimonial);

/**
 * @swagger
 * /api/testimonials/{id}/approve:
 *   patch:
 *     tags: [Testimonials]
 *     summary: Toggle testimonial approval
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approval toggled
 */
router.patch('/:id/approve', protect, approveTestimonial);

module.exports = router;
