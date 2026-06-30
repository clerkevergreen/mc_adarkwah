require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Event = require('./models/Event');
const GalleryItem = require('./models/GalleryItem');

const BASE = process.env.API_URL || 'https://mc-adarkwah.onrender.com';

const fixRelativeUrls = async () => {
  try {
    await connectDB();

    console.log('Fixing event relative URLs...');
    const events = await Event.find({});
    for (const e of events) {
      let changed = false;
      if (e.bannerImage && e.bannerImage.startsWith('/uploads/')) {
        e.bannerImage = BASE + e.bannerImage;
        changed = true;
      }
      if (e.thumbnailImage && e.thumbnailImage.startsWith('/uploads/')) {
        e.thumbnailImage = BASE + e.thumbnailImage;
        changed = true;
      }
      if (e.images) {
        e.images = e.images.map(img => img.startsWith('/uploads/') ? BASE + img : img);
      }
      if (e.videos) {
        for (const v of e.videos) {
          if (v.thumbnail && v.thumbnail.startsWith('/uploads/')) {
            v.thumbnail = BASE + v.thumbnail;
          }
        }
      }
      if (changed) {
        await e.save();
        console.log(`  Fixed event: ${e.title}`);
      }
    }

    console.log('Fixing gallery relative URLs...');
    const gallery = await GalleryItem.find({});
    for (const g of gallery) {
      let changed = false;
      if (g.imageUrl && g.imageUrl.startsWith('/uploads/')) {
        g.imageUrl = BASE + g.imageUrl;
        changed = true;
      }
      if (g.thumbnailUrl && g.thumbnailUrl.startsWith('/uploads/')) {
        g.thumbnailUrl = BASE + g.thumbnailUrl;
        changed = true;
      }
      if (changed) {
        await g.save();
        console.log(`  Fixed gallery: ${g.title}`);
      }
    }

    console.log('\nDone fixing relative URLs!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixRelativeUrls();
