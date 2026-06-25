const VideoHighlight = require('../models/VideoHighlight');

exports.getVideos = async (req, res, next) => {
  try {
    const videos = await VideoHighlight.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
};

exports.getAllVideos = async (req, res, next) => {
  try {
    const videos = await VideoHighlight.find().sort({ order: 1 });
    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
};

exports.createVideo = async (req, res, next) => {
  try {
    const video = await VideoHighlight.create(req.body);
    res.status(201).json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
};

exports.updateVideo = async (req, res, next) => {
  try {
    const video = await VideoHighlight.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
};

exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await VideoHighlight.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    next(error);
  }
};
