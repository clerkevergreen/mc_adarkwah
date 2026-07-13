const Sponsor = require('../models/Sponsor');

exports.getSponsors = async (req, res, next) => {
  try {
    const sponsors = await Sponsor.find().sort({ order: 1 });
    res.json({ success: true, data: sponsors });
  } catch (error) { next(error); }
};

exports.createSponsor = async (req, res, next) => {
  try {
    const { name, logo, website, order } = req.body;
    const sponsor = await Sponsor.create({ name, logo, website, order });
    res.status(201).json({ success: true, data: sponsor });
  } catch (error) { next(error); }
};

exports.updateSponsor = async (req, res, next) => {
  try {
    const { name, logo, website, order } = req.body;
    const updateData = { name, logo, website, order };
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);
    const sponsor = await Sponsor.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!sponsor) return res.status(404).json({ success: false, message: 'Sponsor not found' });
    res.json({ success: true, data: sponsor });
  } catch (error) { next(error); }
};

exports.deleteSponsor = async (req, res, next) => {
  try {
    const sponsor = await Sponsor.findByIdAndDelete(req.params.id);
    if (!sponsor) return res.status(404).json({ success: false, message: 'Sponsor not found' });
    res.json({ success: true, message: 'Sponsor deleted' });
  } catch (error) { next(error); }
};
