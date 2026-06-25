const express = require('express');
const router = express.Router();
const { getStatistics, createStatistic, updateStatistic, deleteStatistic } = require('../controllers/statisticController');
const { protect } = require('../middleware/auth');

router.get('/', getStatistics);
router.post('/', protect, createStatistic);
router.put('/:id', protect, updateStatistic);
router.delete('/:id', protect, deleteStatistic);

module.exports = router;
