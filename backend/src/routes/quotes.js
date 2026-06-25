const express = require('express');
const router = express.Router();
const { createQuote, getQuotes, updateStatus, deleteQuote } = require('../controllers/quoteController');
const { protect } = require('../middleware/auth');
const { quoteLimiter } = require('../middleware/rateLimiter');

router.post('/', quoteLimiter, createQuote);
router.get('/', protect, getQuotes);
router.patch('/:id/status', protect, updateStatus);
router.delete('/:id', protect, deleteQuote);

module.exports = router;
