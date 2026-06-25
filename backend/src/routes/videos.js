const express = require('express');
const router = express.Router();
const { getVideos, getAllVideos, createVideo, updateVideo, deleteVideo } = require('../controllers/videoController');
const { protect } = require('../middleware/auth');

router.get('/', getVideos);
router.get('/all', protect, getAllVideos);
router.post('/', protect, createVideo);
router.put('/:id', protect, updateVideo);
router.delete('/:id', protect, deleteVideo);

module.exports = router;
