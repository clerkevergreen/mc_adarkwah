const express = require('express');
const router = express.Router();
const { getHeroContent, updateHeroContent } = require('../controllers/heroController');
const { protect } = require('../middleware/auth');

router.get('/', getHeroContent);
router.put('/', protect, updateHeroContent);

module.exports = router;
