const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  type: { type: String, default: 'general' },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  error: { type: String, default: '' },
  messageId: { type: String, default: '' },
}, { timestamps: true });

emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ type: 1, createdAt: -1 });
emailLogSchema.index({ status: 1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
