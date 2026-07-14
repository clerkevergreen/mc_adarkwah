const express = require('express');
const router = express.Router();
const { downloadContract } = require('../controllers/contractController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/contracts/{id}:
 *   get:
 *     tags: [Contracts]
 *     summary: Download booking contract as PDF
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Booking not found
 */
router.get('/:id', protect, downloadContract);

module.exports = router;
