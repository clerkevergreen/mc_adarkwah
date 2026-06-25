const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  eventType: { type: String, required: true },
  eventDate: { type: Date },
  guestCount: { type: Number, default: 0 },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'closed'],
    default: 'pending',
    index: true,
  },
}, { timestamps: true });

quoteSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Quote', quoteSchema);
