const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  features: [{ type: String }],
  imageUrl: { type: String, default: '' },
  priceRange: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
