const express = require('express');
const router = express.Router();
const { getFAQs, createFAQ, updateFAQ, deleteFAQ, reorderFAQs } = require('../controllers/faqController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

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
router.put('/reorder', protect, validate.faq.reorder, reorderFAQs);

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
router.post('/', protect, validate.faq.create, createFAQ);

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
router.put('/:id', protect, validate.faq.update, updateFAQ);

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
router.delete('/:id', protect, validate.idParam, deleteFAQ);

module.exports = router;
