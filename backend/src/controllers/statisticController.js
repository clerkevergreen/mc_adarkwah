const Statistic = require('../models/Statistic');

exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await Statistic.find().sort({ order: 1 });
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

exports.createStatistic = async (req, res, next) => {
  try {
    const { label, value, suffix, icon, order } = req.body;
    const stat = await Statistic.create({ label, value: parseInt(value), suffix, icon, order });
    res.status(201).json({ success: true, data: stat });
  } catch (error) {
    next(error);
  }
};

exports.updateStatistic = async (req, res, next) => {
  try {
    const { label, value, suffix, icon, order } = req.body;
    const updateData = { label, value: value !== undefined ? parseInt(value) : undefined, suffix, icon, order };
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);
    const stat = await Statistic.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!stat) return res.status(404).json({ success: false, message: 'Statistic not found' });
    res.json({ success: true, data: stat });
  } catch (error) {
    next(error);
  }
};

exports.deleteStatistic = async (req, res, next) => {
  try {
    const stat = await Statistic.findByIdAndDelete(req.params.id);
    if (!stat) return res.status(404).json({ success: false, message: 'Statistic not found' });
    res.json({ success: true, message: 'Statistic deleted' });
  } catch (error) {
    next(error);
  }
};
