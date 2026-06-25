const NewsItem = require('../models/NewsItem');
const slugify = require('slugify');

exports.getNews = async (req, res, next) => {
  try {
    const { category, featured, page = 1, limit = 10 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const items = await NewsItem.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await NewsItem.countDocuments(query);

    res.json({
      success: true,
      data: items,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) { next(error); }
};

exports.getNewsBySlug = async (req, res, next) => {
  try {
    const item = await NewsItem.findOne({ slug: req.params.slug });
    if (!item) return res.status(404).json({ success: false, message: 'News item not found' });
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
};

exports.createNews = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now();
    const item = await NewsItem.create(data);
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
};

exports.updateNews = async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data.slug;
    const item = await NewsItem.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'News item not found' });
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
};

exports.deleteNews = async (req, res, next) => {
  try {
    const item = await NewsItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'News item not found' });
    res.json({ success: true, message: 'News item deleted' });
  } catch (error) { next(error); }
};
