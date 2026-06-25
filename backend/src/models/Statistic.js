const mongoose = require('mongoose');

const statisticSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  suffix: { type: String, default: '+' },
  label: { type: String, required: true, trim: true },
  icon: { type: String, default: 'star' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Statistic', statisticSchema);
