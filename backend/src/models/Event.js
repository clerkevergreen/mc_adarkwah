const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  duration: { type: String, default: '' },
}, { _id: true });

const sponsorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, default: '' },
  website: { type: String, default: '' },
}, { _id: true });

const eventTestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String, default: '' },
  eventName: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  review: { type: String, default: '' },
  designation: { type: String, default: '' },
}, { _id: true });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  category: {
    type: String,
    enum: ['corporate', 'wedding', 'conference', 'concert', 'product-launch', 'awards-night', 'church-program', 'private-event', 'special-ceremony'],
    required: true,
  },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  date: { type: Date, required: true },
  endDate: { type: Date },
  venue: { type: String, default: '' },
  location: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  attendeeCount: { type: Number, default: 0 },
  bannerImage: { type: String, default: '' },
  thumbnailImage: { type: String, default: '' },
  images: [{ type: String }],
  videos: [videoSchema],
  highlights: [{ type: String }],
  sponsors: [sponsorSchema],
  testimonials: [eventTestimonialSchema],
  isUpcoming: { type: Boolean, default: false, index: true },
  isFeatured: { type: Boolean, default: false, index: true },
  ticketUrl: { type: String, default: '' },
  registrationUrl: { type: String, default: '' },
  tags: [{ type: String }],
}, { timestamps: true });

eventSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = require('slugify')(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

eventSchema.index({ category: 1, isUpcoming: 1, date: -1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Event', eventSchema);
