const Testimonial = require('../models/Testimonial');

exports.getTestimonials = async (req, res, next) => {
  try {
    const { approved } = req.query;
    const query = {};
    if (approved === 'true' || approved === undefined) query.isApproved = true;

    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
};

exports.createTestimonial = async (req, res, next) => {
  try {
    const { name, email, photo, eventName, rating, review, designation } = req.body;
    const testimonial = await Testimonial.create({ name, email, photo, eventName, rating, review, designation });
    res.status(201).json({ success: true, data: testimonial, message: 'Thank you for your testimonial! It will be displayed after approval.' });
  } catch (error) {
    next(error);
  }
};

exports.updateTestimonial = async (req, res, next) => {
  try {
    const { name, email, photo, eventName, rating, review, designation, isApproved } = req.body;
    const updateData = { name, email, photo, eventName, rating, review, designation, isApproved };
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

exports.deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    next(error);
  }
};

exports.approveTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    testimonial.isApproved = !testimonial.isApproved;
    await testimonial.save();
    res.json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};
