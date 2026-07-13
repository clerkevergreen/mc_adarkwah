const GalleryItem = require('../models/GalleryItem');

exports.getItems = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';

    const items = await GalleryItem.find(query).sort({ date: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.getItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const { title, description, imageUrl, thumbnailUrl, category, type, videoUrl, featured } = req.body;
    const item = await GalleryItem.create({ title, description, imageUrl, thumbnailUrl, category, type, videoUrl, featured, date: new Date() });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { title, description, imageUrl, thumbnailUrl, category, type, videoUrl, featured, date } = req.body;
    const updateData = { title, description, imageUrl, thumbnailUrl, category, type, videoUrl, featured };
    if (date) updateData.date = new Date(date);
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    res.json({ success: true, message: 'Gallery item deleted' });
  } catch (error) {
    next(error);
  }
};
