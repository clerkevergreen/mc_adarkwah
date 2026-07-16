const mongoose = require('mongoose');
const crypto = require('crypto');

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
  referenceCode: { type: String, unique: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
    index: true,
  },
}, { timestamps: true });

bookingSchema.pre('save', function (next) {
  if (!this.referenceCode) {
    this.referenceCode = 'MC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ email: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
