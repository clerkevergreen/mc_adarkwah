const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  status: {
    type: String,
    enum: ['available', 'blocked', 'booked'],
    default: 'available',
    index: true,
  },
  reason: { type: String, default: '' },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
}, { timestamps: true });

availabilitySchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);
