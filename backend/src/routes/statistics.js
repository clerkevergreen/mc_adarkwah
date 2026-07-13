const express = require('express');
const router = express.Router();
const { getStatistics, createStatistic, updateStatistic, deleteStatistic } = require('../controllers/statisticController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', getStatistics);
router.post('/', protect, validate.statistic.create, createStatistic);
router.put('/:id', protect, validate.statistic.update, updateStatistic);
router.delete('/:id', protect, validate.idParam, deleteStatistic);

module.exports = router;
