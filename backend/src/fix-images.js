require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const Testimonial = require('./models/Testimonial');
const Service = require('./models/Service');
const GalleryItem = require('./models/GalleryItem');
const NewsItem = require('./models/NewsItem');
const Sponsor = require('./models/Sponsor');
const connectDB = require('./config/db');

const imageMap = {
  'assets/images/events/awards-banner.jpg': 'https://placehold.co/800x400/1a1a2e/e0b354?text=Corporate+Awards',
  'assets/images/events/awards-thumb.jpg': 'https://placehold.co/400x300/1a1a2e/e0b354?text=Awards',
  'assets/images/events/tech-summit-banner.jpg': 'https://placehold.co/800x400/16213e/0ea5e9?text=Tech+Summit',
  'assets/images/events/tech-summit-thumb.jpg': 'https://placehold.co/400x300/16213e/0ea5e9?text=Tech',
  'assets/images/events/wedding-banner.jpg': 'https://placehold.co/800x400/1a1a2e/ec4899?text=Royal+Wedding+Gala',
  'assets/images/events/wedding-thumb.jpg': 'https://placehold.co/400x300/1a1a2e/ec4899?text=Wedding',
  'assets/images/events/concert-banner.jpg': 'https://placehold.co/800x400/1a1a2e/f59e0b?text=Afro+Nation+Festival',
  'assets/images/events/concert-thumb.jpg': 'https://placehold.co/400x300/1a1a2e/f59e0b?text=Concert',
  'assets/images/events/mtn-awards-banner.jpg': 'https://placehold.co/800x400/1a1a2e/22c55e?text=MTN+Music+Awards',
  'assets/images/events/mtn-awards-thumb.jpg': 'https://placehold.co/400x300/1a1a2e/22c55e?text=Awards',
  'assets/images/events/entrepreneurship-banner.jpg': 'https://placehold.co/800x400/16213e/8b5cf6?text=Entrepreneurship+Conf',
  'assets/images/events/entrepreneurship-thumb.jpg': 'https://placehold.co/400x300/16213e/8b5cf6?text=Entrepreneurship',
  'assets/images/events/wedding2-banner.jpg': 'https://placehold.co/800x400/1a1a2e/f472b6?text=Wedding+of+Adwoa+%26+Kwame',
  'assets/images/events/wedding2-thumb.jpg': 'https://placehold.co/400x300/1a1a2e/f472b6?text=Wedding',
  'assets/images/events/innovation-banner.jpg': 'https://placehold.co/800x400/16213e/06b6d4?text=Innovation+Week',
  'assets/images/events/innovation-thumb.jpg': 'https://placehold.co/400x300/16213e/06b6d4?text=Innovation',
};

const fixImages = async () => {
  try {
    await connectDB();

    console.log('Fixing event images...');
    const events = await Event.find({});
    for (const event of events) {
      let changed = false;
      if (imageMap[event.bannerImage]) {
        event.bannerImage = imageMap[event.bannerImage];
        changed = true;
      }
      if (imageMap[event.thumbnailImage]) {
        event.thumbnailImage = imageMap[event.thumbnailImage];
        changed = true;
      }
      if (changed) {
        await event.save();
        console.log(`  Updated: ${event.title}`);
      }
    }

    console.log('Fixing testimonial photos...');
    const testimonialPhotoMap = {
      'assets/images/testimonials/sarah.jpg': 'https://placehold.co/100x100/e0b354/1a1a2e?text=SM',
      'assets/images/testimonials/kwame.jpg': 'https://placehold.co/100x100/e0b354/1a1a2e?text=KA',
      'assets/images/testimonials/akua.jpg': 'https://placehold.co/100x100/e0b354/1a1a2e?text=AO',
      'assets/images/testimonials/james.jpg': 'https://placehold.co/100x100/e0b354/1a1a2e?text=JA',
      'assets/images/testimonials/nana.jpg': 'https://placehold.co/100x100/e0b354/1a1a2e?text=NA',
    };
    const testimonials = await Testimonial.find({});
    for (const t of testimonials) {
      if (testimonialPhotoMap[t.photo]) {
        t.photo = testimonialPhotoMap[t.photo];
        await t.save();
        console.log(`  Updated testimonial: ${t.name}`);
      }
    }

    console.log('Fixing service images...');
    const serviceImageMap = {
      'assets/images/services/wedding.jpg': 'https://placehold.co/600x400/ec4899/1a1a2e?text=Wedding',
      'assets/images/services/corporate.jpg': 'https://placehold.co/600x400/0ea5e9/1a1a2e?text=Corporate',
      'assets/images/services/conference.jpg': 'https://placehold.co/600x400/8b5cf6/1a1a2e?text=Conference',
      'assets/images/services/product-launch.jpg': 'https://placehold.co/600x400/f59e0b/1a1a2e?text=Product+Launch',
      'assets/images/services/awards.jpg': 'https://placehold.co/600x400/e0b354/1a1a2e?text=Awards',
      'assets/images/services/concert.jpg': 'https://placehold.co/600x400/22c55e/1a1a2e?text=Concert',
      'assets/images/services/church.jpg': 'https://placehold.co/600x400/a855f7/1a1a2e?text=Church',
      'assets/images/services/private.jpg': 'https://placehold.co/600x400/06b6d4/1a1a2e?text=Private+Event',
      'assets/images/services/special.jpg': 'https://placehold.co/600x400/f43f5e/1a1a2e?text=Special+Ceremony',
    };
    const services = await Service.find({});
    for (const s of services) {
      if (serviceImageMap[s.imageUrl]) {
        s.imageUrl = serviceImageMap[s.imageUrl];
        await s.save();
        console.log(`  Updated service: ${s.title}`);
      }
    }

    console.log('Fixing gallery images...');
    const galleryImageMap = {
      'assets/images/gallery/corporate-1.jpg': 'https://placehold.co/800x600/0ea5e9/1a1a2e?text=Corporate+Gala',
      'assets/images/gallery/corporate-1-thumb.jpg': 'https://placehold.co/400x300/0ea5e9/1a1a2e?text=Gala',
      'assets/images/gallery/wedding-1.jpg': 'https://placehold.co/800x600/ec4899/1a1a2e?text=Traditional+Wedding',
      'assets/images/gallery/wedding-1-thumb.jpg': 'https://placehold.co/400x300/ec4899/1a1a2e?text=Wedding',
      'assets/images/gallery/conference-1.jpg': 'https://placehold.co/800x600/8b5cf6/1a1a2e?text=Tech+Conference',
      'assets/images/gallery/conference-1-thumb.jpg': 'https://placehold.co/400x300/8b5cf6/1a1a2e?text=Tech',
      'assets/images/gallery/concert-1.jpg': 'https://placehold.co/800x600/f59e0b/1a1a2e?text=Afrobeat+Concert',
      'assets/images/gallery/concert-1-thumb.jpg': 'https://placehold.co/400x300/f59e0b/1a1a2e?text=Concert',
      'assets/images/gallery/awards-1.jpg': 'https://placehold.co/800x600/e0b354/1a1a2e?text=Awards+Night',
      'assets/images/gallery/awards-1-thumb.jpg': 'https://placehold.co/400x300/e0b354/1a1a2e?text=Awards',
      'assets/images/gallery/church-1.jpg': 'https://placehold.co/800x600/a855f7/1a1a2e?text=Church+Program',
      'assets/images/gallery/church-1-thumb.jpg': 'https://placehold.co/400x300/a855f7/1a1a2e?text=Church',
      'assets/images/gallery/corporate-2.jpg': 'https://placehold.co/800x600/22c55e/1a1a2e?text=Product+Launch',
      'assets/images/gallery/corporate-2-thumb.jpg': 'https://placehold.co/400x300/22c55e/1a1a2e?text=Launch',
      'assets/images/gallery/wedding-2.jpg': 'https://placehold.co/800x600/f472b6/1a1a2e?text=White+Wedding',
      'assets/images/gallery/wedding-2-thumb.jpg': 'https://placehold.co/400x300/f472b6/1a1a2e?text=Wedding',
      'assets/images/gallery/conference-2.jpg': 'https://placehold.co/800x600/06b6d4/1a1a2e?text=Business+Summit',
      'assets/images/gallery/conference-2-thumb.jpg': 'https://placehold.co/400x300/06b6d4/1a1a2e?text=Summit',
      'assets/images/gallery/concert-2.jpg': 'https://placehold.co/800x600/22c55e/1a1a2e?text=Music+Festival',
      'assets/images/gallery/concert-2-thumb.jpg': 'https://placehold.co/400x300/22c55e/1a1a2e?text=Festival',
    };
    const gallery = await GalleryItem.find({});
    for (const g of gallery) {
      let changed = false;
      if (galleryImageMap[g.imageUrl]) {
        g.imageUrl = galleryImageMap[g.imageUrl];
        changed = true;
      }
      if (g.thumbnailUrl && galleryImageMap[g.thumbnailUrl]) {
        g.thumbnailUrl = galleryImageMap[g.thumbnailUrl];
        changed = true;
      }
      if (changed) {
        await g.save();
        console.log(`  Updated gallery: ${g.title}`);
      }
    }

    console.log('Fixing news images...');
    const newsImageMap = {
      'assets/images/news/awards-announcement.jpg': 'https://placehold.co/800x400/e0b354/1a1a2e?text=Awards+Announcement',
      'assets/images/news/hosting-tips.jpg': 'https://placehold.co/800x400/0ea5e9/1a1a2e?text=Hosting+Tips',
      'assets/images/news/behind-scenes.jpg': 'https://placehold.co/800x400/8b5cf6/1a1a2e?text=Behind+the+Scenes',
    };
    const news = await NewsItem.find({});
    for (const n of news) {
      if (newsImageMap[n.imageUrl]) {
        n.imageUrl = newsImageMap[n.imageUrl];
        await n.save();
        console.log(`  Updated news: ${n.title}`);
      }
    }

    console.log('Fixing sponsor logos...');
    const sponsorLogoMap = {
      'assets/images/sponsors/mtn.png': 'https://placehold.co/150x50/ffcc00/000000?text=MTN',
      'assets/images/sponsors/tourism.png': 'https://placehold.co/150x50/22c55e/ffffff?text=GTA',
      'assets/images/sponsors/aicc.png': 'https://placehold.co/150x50/0ea5e9/ffffff?text=AICC',
      'assets/images/sponsors/kempinski.png': 'https://placehold.co/150x50/8b5cf6/ffffff?text=Kempinski',
      'assets/images/sponsors/starlink.png': 'https://placehold.co/150x50/1a1a2e/ffffff?text=Starlink',
      'assets/images/sponsors/eventpro.png': 'https://placehold.co/150x50/e0b354/1a1a2e?text=EventPro',
    };
    const sponsors = await Sponsor.find({});
    for (const s of sponsors) {
      if (sponsorLogoMap[s.logo]) {
        s.logo = sponsorLogoMap[s.logo];
        await s.save();
        console.log(`  Updated sponsor: ${s.name}`);
      }
    }

    console.log('\nAll images fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Fix error:', error);
    process.exit(1);
  }
};

fixImages();
