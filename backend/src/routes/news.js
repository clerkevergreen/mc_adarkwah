const express = require('express');
const router = express.Router();
const { getNews, getNewsBySlug, createNews, updateNews, deleteNews } = require('../controllers/newsController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * /api/news:
 *   get:
 *     tags: [News]
 *     summary: Get news items
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: News items
 */
router.get('/', getNews);

/**
 * @swagger
 * /api/news/{slug}:
 *   get:
 *     tags: [News]
 *     summary: Get news by slug
 *     responses:
 *       200:
 *         description: News item
 */
router.get('/:slug', getNewsBySlug);

/**
 * @swagger
 * /api/news:
 *   post:
 *     tags: [News]
 *     summary: Create a news item
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: News created
 */
router.post('/', protect, validate.news.create, createNews);

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     tags: [News]
 *     summary: Update a news item
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: News updated
 */
router.put('/:id', protect, validate.news.update, updateNews);

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     tags: [News]
 *     summary: Delete a news item
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: News deleted
 */
router.delete('/:id', protect, validate.idParam, deleteNews);

module.exports = router;
