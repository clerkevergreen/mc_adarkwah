const NavItem = require('../models/NavItem');

exports.getNavItems = async (req, res, next) => {
  try {
    const items = await NavItem.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.getAllNavItems = async (req, res, next) => {
  try {
    const items = await NavItem.find().sort({ order: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.createNavItem = async (req, res, next) => {
  try {
    const { label, path, fragment, icon, order, isActive } = req.body;
    const item = await NavItem.create({ label, path, fragment, icon, order, isActive });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateNavItem = async (req, res, next) => {
  try {
    const { label, path, fragment, icon, order, isActive } = req.body;
    const updateData = { label, path, fragment, icon, order, isActive };
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);
    const item = await NavItem.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Nav item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.deleteNavItem = async (req, res, next) => {
  try {
    const item = await NavItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Nav item not found' });
    res.json({ success: true, message: 'Nav item deleted' });
  } catch (error) {
    next(error);
  }
};
