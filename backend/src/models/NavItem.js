const mongoose = require('mongoose');

const navItemSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  path: { type: String, default: '/' },
  fragment: { type: String, default: '' },
  icon: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('NavItem', navItemSchema);
