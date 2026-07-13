const express = require('express');
const router = express.Router();
const { getHeroContent, updateHeroContent } = require('../controllers/heroController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', getHeroContent);
router.put('/', protect, validate.hero.update, updateHeroContent);

module.exports = router;
