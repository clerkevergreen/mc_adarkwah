const express = require('express');
const router = express.Router();
const { getItems, getItem, createItem, updateItem, deleteItem } = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * /api/gallery:
 *   get:
 *     tags: [Gallery]
 *     summary: Get gallery items
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Gallery items
 */
router.get('/', getItems);

/**
 * @swagger
 * /api/gallery/{id}:
 *   get:
 *     tags: [Gallery]
 *     summary: Get gallery item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Gallery item
 */
router.get('/:id', getItem);

/**
 * @swagger
 * /api/gallery:
 *   post:
 *     tags: [Gallery]
 *     summary: Create gallery item
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Gallery item created
 */
router.post('/', protect, validate.gallery.create, createItem);

/**
 * @swagger
 * /api/gallery/{id}:
 *   put:
 *     tags: [Gallery]
 *     summary: Update gallery item
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gallery item updated
 */
router.put('/:id', protect, validate.gallery.update, updateItem);

/**
 * @swagger
 * /api/gallery/{id}:
 *   delete:
 *     tags: [Gallery]
 *     summary: Delete gallery item
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gallery item deleted
 */
router.delete('/:id', protect, validate.idParam, deleteItem);

module.exports = router;
