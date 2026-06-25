const express = require('express');
const router = express.Router();
const { getNavItems, getAllNavItems, createNavItem, updateNavItem, deleteNavItem } = require('../controllers/navController');
const { protect } = require('../middleware/auth');

router.get('/', getNavItems);
router.get('/all', protect, getAllNavItems);
router.post('/', protect, createNavItem);
router.put('/:id', protect, updateNavItem);
router.delete('/:id', protect, deleteNavItem);

module.exports = router;
