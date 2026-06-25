const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: { type: String, default: 'MC Adarkwah' },
  title: { type: String, default: 'Professional Master of Ceremonies & Event Host' },
  bio: { type: String, default: '' },
  fullBio: { type: String, default: '' },
  image: { type: String, default: '' },
  image2: { type: String, default: '' },
  yearsExperience: { type: Number, default: 10 },
  achievements: [{ type: String }],
  milestones: [{
    year: { type: String },
    title: { type: String },
    description: { type: String },
  }],
  socialMedia: {
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    tiktok: { type: String, default: '' },
  },
  contact: {
    phone: { type: String, default: '' },
    phone2: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    office: { type: String, default: '' },
  },
  exchangeRate: { type: Number, default: 0.077 },
  budgetRanges: [{
    min: { type: Number, default: 2000 },
    max: { type: Number, default: 5000 },
    label: { type: String, default: '' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
