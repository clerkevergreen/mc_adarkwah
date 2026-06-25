const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
    index: true,
  },
}, { timestamps: true });

registrationSchema.index({ event: 1, status: 1, createdAt: -1 });
registrationSchema.index({ email: 1 });

module.exports = mongoose.model('EventRegistration', registrationSchema);
