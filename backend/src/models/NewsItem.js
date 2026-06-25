const mongoose = require('mongoose');

const newsItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  excerpt: { type: String, default: '' },
  content: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  category: { type: String, default: 'Announcements' },
  author: { type: String, default: 'MC Adarkwah Team' },
  tags: [{ type: String }],
  featured: { type: Boolean, default: false, index: true },
}, { timestamps: true });

newsItemSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = require('slugify')(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

newsItemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('NewsItem', newsItemSchema);
