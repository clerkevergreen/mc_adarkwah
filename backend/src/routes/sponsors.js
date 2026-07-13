const express = require('express');
const router = express.Router();
const { getSponsors, createSponsor, updateSponsor, deleteSponsor } = require('../controllers/sponsorController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * /api/sponsors:
 *   get:
 *     tags: [Sponsors]
 *     summary: Get all sponsors
 *     responses:
 *       200:
 *         description: List of sponsors
 */
router.get('/', getSponsors);

/**
 * @swagger
 * /api/sponsors:
 *   post:
 *     tags: [Sponsors]
 *     summary: Create a sponsor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Sponsor created
 */
router.post('/', protect, validate.sponsor.create, createSponsor);

/**
 * @swagger
 * /api/sponsors/{id}:
 *   put:
 *     tags: [Sponsors]
 *     summary: Update a sponsor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sponsor updated
 */
router.put('/:id', protect, validate.sponsor.update, updateSponsor);

/**
 * @swagger
 * /api/sponsors/{id}:
 *   delete:
 *     tags: [Sponsors]
 *     summary: Delete a sponsor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sponsor deleted
 */
router.delete('/:id', protect, validate.idParam, deleteSponsor);

module.exports = router;
