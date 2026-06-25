const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  category: {
    type: String,
    enum: ['corporate-events', 'weddings', 'conferences', 'concerts', 'awards-nights', 'church-programs'],
    required: true,
    index: true,
  },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  videoUrl: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false, index: true },
  width: { type: Number },
  height: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
