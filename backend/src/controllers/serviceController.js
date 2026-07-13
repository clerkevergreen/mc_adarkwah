const Service = require('../models/Service');

exports.getServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json({ success: true, data: services });
  } catch (error) { next(error); }
};

exports.createService = async (req, res, next) => {
  try {
    const { icon, title, shortDescription, description, features, imageUrl, priceRange, order } = req.body;
    const service = await Service.create({ icon, title, shortDescription, description, features, imageUrl, priceRange, order });
    res.status(201).json({ success: true, data: service });
  } catch (error) { next(error); }
};

exports.updateService = async (req, res, next) => {
  try {
    const { icon, title, shortDescription, description, features, imageUrl, priceRange, order } = req.body;
    const updateData = { icon, title, shortDescription, description, features, imageUrl, priceRange, order };
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);
    const service = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (error) { next(error); }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) { next(error); }
};
