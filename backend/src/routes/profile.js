const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', getProfile);
router.put('/', protect, validate.profile.update, updateProfile);

module.exports = router;
