const express = require('express');
const router = express.Router();
const { getNavItems, getAllNavItems, createNavItem, updateNavItem, deleteNavItem } = require('../controllers/navController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', getNavItems);
router.get('/all', protect, getAllNavItems);
router.post('/', protect, validate.nav.create, createNavItem);
router.put('/:id', protect, validate.nav.update, updateNavItem);
router.delete('/:id', protect, validate.idParam, deleteNavItem);

module.exports = router;
