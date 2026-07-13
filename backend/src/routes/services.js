const express = require('express');
const router = express.Router();
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * /api/services:
 *   get:
 *     tags: [Services]
 *     summary: Get all services
 *     responses:
 *       200:
 *         description: List of services
 */
router.get('/', getServices);

/**
 * @swagger
 * /api/services:
 *   post:
 *     tags: [Services]
 *     summary: Create a service
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Service created
 */
router.post('/', protect, validate.service.create, createService);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     tags: [Services]
 *     summary: Update a service
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service updated
 */
router.put('/:id', protect, validate.service.update, updateService);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     tags: [Services]
 *     summary: Delete a service
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service deleted
 */
router.delete('/:id', protect, validate.idParam, deleteService);

module.exports = router;
