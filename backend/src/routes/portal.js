const express = require('express');
const router = express.Router();
const { lookup, downloadContract } = require('../controllers/portalController');

/**
 * @swagger
 * /api/portal/lookup:
 *   post:
 *     tags: [Portal]
 *     summary: Look up a booking by email and reference code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               referenceCode: { type: string }
 *     responses:
 *       200:
 *         description: Booking found
 *       404:
 *         description: Booking not found
 */
router.post('/lookup', lookup);

/**
 * @swagger
 * /api/portal/{id}/contract:
 *   get:
 *     tags: [Portal]
 *     summary: Download contract PDF (client portal)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF file
 *       404:
 *         description: Booking not found
 */
router.get('/:id/contract', downloadContract);

module.exports = router;
