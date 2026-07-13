const express = require('express');
const router = express.Router();
const { createQuote, getQuotes, updateStatus, deleteQuote } = require('../controllers/quoteController');
const { protect } = require('../middleware/auth');
const { quoteLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');

router.post('/', quoteLimiter, validate.quote.create, createQuote);
router.get('/', protect, getQuotes);
router.patch('/:id/status', protect, validate.quote.statusUpdate, updateStatus);
router.delete('/:id', protect, validate.idParam, deleteQuote);

module.exports = router;
