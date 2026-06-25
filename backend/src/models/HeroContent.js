const mongoose = require('mongoose');

const heroContentSchema = new mongoose.Schema({
  badge: { type: String, default: 'Top-Rated Professional MC' },
  title: { type: String, default: 'Making Every Event Memorable' },
  subtitle: { type: String, default: 'Professional Event Host | Corporate Events | Weddings | Conferences | Concerts' },
  primaryBtnText: { type: String, default: 'Book MC Adarkwah' },
  primaryBtnAction: { type: String, default: 'booking' },
  secondaryBtnText: { type: String, default: 'View Events' },
  secondaryBtnAction: { type: String, default: 'events' },
  stat1Value: { type: String, default: '500+' },
  stat1Label: { type: String, default: 'Events Hosted' },
  stat1Icon: { type: String, default: '🎤' },
  stat2Value: { type: String, default: '4.9/5' },
  stat2Label: { type: String, default: 'Client Rating' },
  stat2Icon: { type: String, default: '⭐' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('HeroContent', heroContentSchema);
