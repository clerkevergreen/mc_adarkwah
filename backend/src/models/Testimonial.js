const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  photo: { type: String, default: '' },
  eventName: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, required: true },
  designation: { type: String, default: '' },
  isApproved: { type: Boolean, default: false, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
