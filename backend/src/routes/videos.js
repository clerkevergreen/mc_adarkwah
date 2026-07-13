const express = require('express');
const router = express.Router();
const { getVideos, getAllVideos, createVideo, updateVideo, deleteVideo } = require('../controllers/videoController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', getVideos);
router.get('/all', protect, getAllVideos);
router.post('/', protect, validate.video.create, createVideo);
router.put('/:id', protect, validate.video.update, updateVideo);
router.delete('/:id', protect, validate.idParam, deleteVideo);

module.exports = router;
