const mongoose = require('mongoose');

const videoHighlightSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  thumbnail: { type: String, default: '' },
  url: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('VideoHighlight', videoHighlightSchema);
