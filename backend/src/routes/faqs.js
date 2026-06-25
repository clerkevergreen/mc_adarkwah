const express = require('express');
const router = express.Router();
const { getFAQs, createFAQ, updateFAQ, deleteFAQ, reorderFAQs } = require('../controllers/faqController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/faqs:
 *   get:
 *     tags: [FAQs]
 *     summary: Get all FAQs
 *     responses:
 *       200:
 *         description: List of FAQs
 */
router.get('/', getFAQs);

/**
 * @swagger
 * /api/faqs/reorder:
 *   put:
 *     tags: [FAQs]
 *     summary: Reorder FAQs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: FAQs reordered
 */
router.put('/reorder', protect, reorderFAQs);

/**
 * @swagger
 * /api/faqs/{id}:
 *   post:
 *     tags: [FAQs]
 *     summary: Create an FAQ
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: FAQ created
 */
router.post('/', protect, createFAQ);

/**
 * @swagger
 * /api/faqs/{id}:
 *   put:
 *     tags: [FAQs]
 *     summary: Update an FAQ
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: FAQ updated
 */
router.put('/:id', protect, updateFAQ);

/**
 * @swagger
 * /api/faqs/{id}:
 *   delete:
 *     tags: [FAQs]
 *     summary: Delete an FAQ
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: FAQ deleted
 */
router.delete('/:id', protect, deleteFAQ);

module.exports = router;
