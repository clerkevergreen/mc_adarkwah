const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  eventType: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventLocation: { type: String, default: '' },
  guestCount: { type: Number, default: 0 },
  budgetRange: { type: String, default: '' },
  additionalNotes: { type: String, default: '' },
  agreeToTerms: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
    index: true,
  },
}, { timestamps: true });

bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ email: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
