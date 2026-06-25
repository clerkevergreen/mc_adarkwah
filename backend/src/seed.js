require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const Event = require('./models/Event');
const Testimonial = require('./models/Testimonial');
const Service = require('./models/Service');
const GalleryItem = require('./models/GalleryItem');
const FAQ = require('./models/FAQ');
const NewsItem = require('./models/NewsItem');
const Sponsor = require('./models/Sponsor');

const connectDB = require('./config/db');

const seed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await Promise.all([
      Admin.deleteMany({}), Event.deleteMany({}), Testimonial.deleteMany({}),
      Service.deleteMany({}), GalleryItem.deleteMany({}), FAQ.deleteMany({}),
      NewsItem.deleteMany({}), Sponsor.deleteMany({}),
    ]);

    console.log('Seeding admin...');
    const admin = await Admin.create({ name: 'MC Adarkwah', email: 'admin@mcadarkwah.com', password: 'Admin123!', role: 'superadmin' });
    console.log(`  Admin created: ${admin.email}`);

    console.log('Seeding events...');
    const events = await Event.create([
      {
        title: 'Ghana Corporate Excellence Awards 2026', category: 'awards-night',
        description: 'The most prestigious corporate awards ceremony celebrating excellence in Ghanaian business.',
        shortDescription: 'Celebrating corporate excellence in Ghana',
        date: new Date('2026-08-15'), venue: 'Accra International Conference Centre',
        location: 'Accra, Ghana', city: 'Accra', country: 'Ghana',
        attendeeCount: 2000, bannerImage: 'https://placehold.co/800x400/1a1a2e/e0b354?text=Corporate+Awards',
        thumbnailImage: 'https://placehold.co/400x300/1a1a2e/e0b354?text=Awards',
        highlights: ['Red carpet arrivals', '20 award categories', 'Live performances', 'Networking reception'],
        isUpcoming: true, isFeatured: true,
        registrationUrl: 'https://example.com/register',
        tags: ['awards', 'corporate', 'ghana'],
      },
      {
        title: 'Pan-African Tech Summit', category: 'conference',
        description: 'Africa\'s largest technology conference bringing together innovators, entrepreneurs, and investors.',
        shortDescription: 'Africa\'s premier technology conference',
        date: new Date('2026-09-20'), venue: 'Kempinski Hotel Gold Coast City',
        location: 'Accra, Ghana', city: 'Accra', country: 'Ghana',
        attendeeCount: 5000, bannerImage: 'https://placehold.co/800x400/16213e/0ea5e9?text=Tech+Summit',
        thumbnailImage: 'https://placehold.co/400x300/16213e/0ea5e9?text=Tech',
        highlights: ['Keynote speakers', 'Panel discussions', 'Startup pitch competition', 'Networking sessions'],
        isUpcoming: true, isFeatured: true,
        ticketUrl: 'https://example.com/tickets',
        tags: ['tech', 'conference', 'africa', 'innovation'],
      },
      {
        title: 'Royal Wedding Gala', category: 'wedding',
        description: 'An exquisite wedding ceremony and reception for a high-profile couple.',
        shortDescription: 'Luxurious wedding celebration',
        date: new Date('2026-10-05'), venue: 'La Palm Royal Beach Hotel',
        location: 'Accra, Ghana', city: 'Accra', country: 'Ghana',
        attendeeCount: 800, bannerImage: 'https://placehold.co/800x400/1a1a2e/ec4899?text=Royal+Wedding+Gala',
        thumbnailImage: 'https://placehold.co/400x300/1a1a2e/ec4899?text=Wedding',
        highlights: ['Candlelight ceremony', '10-course dinner', 'Live band', 'Fireworks display'],
        isUpcoming: true, isFeatured: true,
        tags: ['wedding', 'gala', 'luxury'],
      },
      {
        title: 'Afro Nation Music Festival', category: 'concert',
        description: 'The biggest Afrobeat music festival featuring international and local artists.',
        shortDescription: 'The ultimate Afrobeat music experience',
        date: new Date('2026-11-12'), venue: 'Independence Square',
        location: 'Accra, Ghana', city: 'Accra', country: 'Ghana',
        attendeeCount: 25000, bannerImage: 'https://placehold.co/800x400/1a1a2e/f59e0b?text=Afro+Nation+Festival',
        thumbnailImage: 'https://placehold.co/400x300/1a1a2e/f59e0b?text=Concert',
        highlights: ['20+ international artists', 'VIP lounges', 'Food village', 'Art installations'],
        isUpcoming: true, isFeatured: false,
        ticketUrl: 'https://example.com/tickets',
        tags: ['concert', 'music', 'festival', 'afrobeat'],
      },
      {
        title: 'MTN Ghana Music Awards 2025', category: 'awards-night',
        description: 'The night Ghana\'s music industry came together to celebrate the best in the business.',
        shortDescription: 'Ghana\'s biggest music awards ceremony',
        date: new Date('2025-05-10'), venue: 'Accra International Conference Centre',
        location: 'Accra, Ghana', city: 'Accra', country: 'Ghana',
        attendeeCount: 3000, bannerImage: 'https://placehold.co/800x400/1a1a2e/22c55e?text=MTN+Music+Awards',
        thumbnailImage: 'https://placehold.co/400x300/1a1a2e/22c55e?text=Awards',
        highlights: ['Outstanding performance by Sarkodie', 'Surprise collaboration', 'Emotional tribute', 'Record-breaking attendance'],
        isUpcoming: false, isFeatured: true,
        tags: ['awards', 'music', 'ghana', 'mtn'],
      },
      {
        title: 'Global Entrepreneurship Conference', category: 'conference',
        description: 'Bringing together 500+ entrepreneurs from across the globe.',
        shortDescription: 'Empowering the next generation of entrepreneurs',
        date: new Date('2025-03-22'), venue: 'Marriott Hotel',
        location: 'Accra, Ghana', city: 'Accra', country: 'Ghana',
        attendeeCount: 1500, bannerImage: 'https://placehold.co/800x400/16213e/8b5cf6?text=Entrepreneurship+Conf',
        thumbnailImage: 'https://placehold.co/400x300/16213e/8b5cf6?text=Entrepreneurship',
        highlights: ['50+ speakers', 'Workshops', 'Networking sessions', 'Investment opportunities'],
        isUpcoming: false, isFeatured: false,
        tags: ['entrepreneurship', 'conference', 'global'],
      },
      {
        title: 'Luxury Wedding of Adwoa & Kwame', category: 'wedding',
        description: 'A magnificent traditional and white wedding ceremony.',
        shortDescription: 'A spectacular wedding celebration',
        date: new Date('2025-02-14'), venue: 'Movenpick Ambassador Hotel',
        location: 'Accra, Ghana', city: 'Accra', country: 'Ghana',
        attendeeCount: 600, bannerImage: 'https://placehold.co/800x400/1a1a2e/f472b6?text=Wedding+of+Adwoa+%26+Kwame',
        thumbnailImage: 'https://placehold.co/400x300/1a1a2e/f472b6?text=Wedding',
        highlights: ['Traditional marriage ceremony', 'White wedding', 'Reception', 'Fireworks'],
        isUpcoming: false, isFeatured: false,
        tags: ['wedding', 'luxury', 'traditional', 'white-wedding'],
      },
      {
        title: 'Ghana Innovation Week 2025', category: 'conference',
        description: 'A week-long celebration of innovation and technology in Ghana.',
        shortDescription: 'Celebrating Ghanaian innovation',
        date: new Date('2025-07-18'), venue: 'University of Ghana',
        location: 'Accra, Ghana', city: 'Accra', country: 'Ghana',
        attendeeCount: 10000, bannerImage: 'https://placehold.co/800x400/16213e/06b6d4?text=Innovation+Week',
        thumbnailImage: 'https://placehold.co/400x300/16213e/06b6d4?text=Innovation',
        highlights: ['Innovation expo', 'Hackathon', 'Panel discussions', 'Award ceremony'],
        isUpcoming: false, isFeatured: false,
        tags: ['innovation', 'tech', 'ghana', 'week'],
      },
    ]);
    console.log(`  ${events.length} events created`);

    console.log('Seeding testimonials...');
    const testimonials = await Testimonial.create([
      { name: 'Sarah Mensah', photo: 'https://placehold.co/100x100/e0b354/1a1a2e?text=SM', eventName: 'Corporate Gala Night 2025', rating: 5, review: 'MC Adarkwah was absolutely phenomenal! She kept our guests engaged throughout the entire event. Her energy and professionalism are unmatched. Our corporate gala was a huge success because of her!', designation: 'Event Director, MTN Ghana', isApproved: true },
      { name: 'Kwame Asante', photo: 'https://placehold.co/100x100/e0b354/1a1a2e?text=KA', eventName: 'Traditional Wedding', rating: 5, review: 'We couldn\'t have asked for a better MC for our wedding. She blended tradition with modern elegance perfectly. All our guests were impressed and kept asking who our MC was!', designation: 'Groom', isApproved: true },
      { name: 'Dr. Akua Ofori', photo: 'https://placehold.co/100x100/e0b354/1a1a2e?text=AO', eventName: 'Pan-African Health Summit', rating: 5, review: 'MC Adarkwah handled our international health summit with remarkable professionalism. She managed diverse speakers and kept the conference flowing seamlessly. Highly recommended for any professional event.', designation: 'Conference Chair, WHO Africa', isApproved: true },
      { name: 'James Appiah', photo: 'https://placehold.co/100x100/e0b354/1a1a2e?text=JA', eventName: 'Product Launch', rating: 5, review: 'Our product launch was made extraordinary by MC Adarkwah. She built incredible anticipation and kept the audience engaged throughout. The feedback from our partners was overwhelmingly positive.', designation: 'CEO, TechStart Ghana', isApproved: true },
      { name: 'Nana Ama', photo: 'https://placehold.co/100x100/e0b354/1a1a2e?text=NA', eventName: 'Awards Night', rating: 5, review: 'She brought so much class and elegance to our awards ceremony. Her voice, her presence, her ability to handle unexpected moments - everything was perfect. She is truly a world-class MC.', designation: 'Board Member, Ghana Events Awards', isApproved: true },
    ]);
    console.log(`  ${testimonials.length} testimonials created`);

    console.log('Seeding services...');
    const services = await Service.create([
      { icon: 'heart', title: 'Wedding Hosting', shortDescription: 'Make your special day unforgettable with professional wedding MC services.', description: 'From traditional ceremonies to white weddings, I bring elegance, humor, and professionalism to your special day. I work closely with couples to understand their love story and create a personalized hosting experience that reflects their unique personality.', features: ['Traditional wedding ceremonies', 'White wedding receptions', 'Engagement parties', 'Bridal showers', 'Rehearsal dinners'], imageUrl: 'https://placehold.co/600x400/ec4899/1a1a2e?text=Wedding', priceRange: 'GHS 3,000 - 10,000', order: 1 },
      { icon: 'briefcase', title: 'Corporate Events', shortDescription: 'Professional hosting for corporate functions, meetings, and galas.', description: 'Delivering polished, professional hosting for corporate events of all sizes. From board meetings to annual general meetings, product launches to staff parties, I ensure your corporate message is delivered with clarity and impact.', features: ['Annual general meetings', 'Staff parties & retreats', 'Board meetings', 'Corporate galas', 'Team building events'], imageUrl: 'https://placehold.co/600x400/0ea5e9/1a1a2e?text=Corporate', priceRange: 'GHS 5,000 - 20,000', order: 2 },
      { icon: 'users', title: 'Conferences & Summits', shortDescription: 'Expert moderation and hosting for conferences and business summits.', description: 'As an experienced conference host, I keep your audience engaged, manage panel discussions seamlessly, and ensure your event runs on schedule. I bring energy and professionalism to every stage.', features: ['Keynote introductions', 'Panel moderation', 'Q&A sessions', 'Workshop facilitation', 'Networking sessions'], imageUrl: 'https://placehold.co/600x400/8b5cf6/1a1a2e?text=Conference', priceRange: 'GHS 5,000 - 15,000', order: 3 },
      { icon: 'zap', title: 'Product Launches', shortDescription: 'Exciting and engaging product launch event hosting.', description: 'Create buzz and excitement around your product launch. I build anticipation, keep the energy high, and ensure your product takes center stage. Your launch deserves to be memorable.', features: ['Press conferences', 'Product demonstrations', 'Audience engagement', 'Media coordination', 'Brand storytelling'], imageUrl: 'https://placehold.co/600x400/f59e0b/1a1a2e?text=Product+Launch', priceRange: 'GHS 4,000 - 12,000', order: 4 },
      { icon: 'award', title: 'Awards Nights', shortDescription: 'Glamorous and professional awards ceremony hosting.', description: 'From red carpet to the final award, I bring glamour, excitement, and professionalism to awards ceremonies. I ensure each moment is celebrated and every award presenter and recipient feels special.', features: ['Red carpet hosting', 'Award presentations', 'Entertainment coordination', 'VIP management', 'After-party hosting'], imageUrl: 'https://placehold.co/600x400/e0b354/1a1a2e?text=Awards', priceRange: 'GHS 5,000 - 15,000', order: 5 },
      { icon: 'music', title: 'Concert Hosting', shortDescription: 'High-energy concert and music festival hosting.', description: 'Bringing unmatched energy and stage presence to concerts and music festivals. I keep the crowd engaged between performances, make announcements, and ensure the show flows smoothly from start to finish.', features: ['Stage announcements', 'Artist introductions', 'Crowd engagement', 'Schedule management', 'VIP experiences'], imageUrl: 'https://placehold.co/600x400/22c55e/1a1a2e?text=Concert', priceRange: 'GHS 5,000 - 25,000', order: 6 },
      { icon: 'church', title: 'Church Programs', shortDescription: 'Reverent and engaging church event hosting.', description: 'With deep respect for religious traditions, I provide dignified and engaging hosting for church programs, conventions, and special services.', features: ['Church conventions', 'Revivals & crusades', 'Anniversary celebrations', 'Youth programs', 'Fundraising events'], imageUrl: 'https://placehold.co/600x400/a855f7/1a1a2e?text=Church', priceRange: 'GHS 2,000 - 8,000', order: 7 },
      { icon: 'calendar', title: 'Private Events', shortDescription: 'Exclusive hosting for private celebrations and parties.', description: 'Make your private celebration unforgettable. From milestone birthdays to anniversary parties, I create a warm, celebratory atmosphere that your guests will remember.', features: ['Birthday parties', 'Anniversary celebrations', 'Graduation parties', 'Housewarming events', 'Family reunions'], imageUrl: 'https://placehold.co/600x400/06b6d4/1a1a2e?text=Private+Event', priceRange: 'GHS 2,000 - 8,000', order: 8 },
      { icon: 'star', title: 'Special Ceremonies', shortDescription: 'Customized hosting for unique and special ceremonies.', description: 'Every event is unique. I specialize in creating customized hosting experiences for special ceremonies including baby showers, naming ceremonies, memorial services, and other milestone events.', features: ['Baby showers', 'Naming ceremonies', 'Memorial services', 'Graduation ceremonies', 'Custom celebrations'], imageUrl: 'https://placehold.co/600x400/f43f5e/1a1a2e?text=Special+Ceremony', priceRange: 'GHS 2,000 - 10,000', order: 9 },
    ]);
    console.log(`  ${services.length} services created`);

    console.log('Seeding gallery...');
    const galleryItems = await GalleryItem.create([
      { title: 'Corporate Gala Night', description: 'Annual corporate awards ceremony', imageUrl: 'https://placehold.co/800x600/0ea5e9/1a1a2e?text=Corporate+Gala', thumbnailUrl: 'https://placehold.co/400x300/0ea5e9/1a1a2e?text=Gala', category: 'corporate-events', type: 'image', date: new Date('2025-06-15'), featured: true },
      { title: 'Traditional Wedding', description: 'Beautiful traditional wedding ceremony', imageUrl: 'https://placehold.co/800x600/ec4899/1a1a2e?text=Traditional+Wedding', thumbnailUrl: 'https://placehold.co/400x300/ec4899/1a1a2e?text=Wedding', category: 'weddings', type: 'image', date: new Date('2025-03-20'), featured: true },
      { title: 'Tech Conference 2025', description: 'Annual technology conference', imageUrl: 'https://placehold.co/800x600/8b5cf6/1a1a2e?text=Tech+Conference', thumbnailUrl: 'https://placehold.co/400x300/8b5cf6/1a1a2e?text=Tech', category: 'conferences', type: 'image', date: new Date('2025-05-10'), featured: false },
      { title: 'Afrobeat Concert', description: 'Live concert experience', imageUrl: 'https://placehold.co/800x600/f59e0b/1a1a2e?text=Afrobeat+Concert', thumbnailUrl: 'https://placehold.co/400x300/f59e0b/1a1a2e?text=Concert', category: 'concerts', type: 'image', date: new Date('2025-08-05'), featured: true },
      { title: 'Awards Night', description: 'Annual awards ceremony', imageUrl: 'https://placehold.co/800x600/e0b354/1a1a2e?text=Awards+Night', thumbnailUrl: 'https://placehold.co/400x300/e0b354/1a1a2e?text=Awards', category: 'awards-nights', type: 'image', date: new Date('2025-04-22'), featured: false },
      { title: 'Church Program', description: 'Annual church convention', imageUrl: 'https://placehold.co/800x600/a855f7/1a1a2e?text=Church+Program', thumbnailUrl: 'https://placehold.co/400x300/a855f7/1a1a2e?text=Church', category: 'church-programs', type: 'image', date: new Date('2025-09-30'), featured: false },
      { title: 'Product Launch', description: 'Major product launch event', imageUrl: 'https://placehold.co/800x600/22c55e/1a1a2e?text=Product+Launch', thumbnailUrl: 'https://placehold.co/400x300/22c55e/1a1a2e?text=Launch', category: 'corporate-events', type: 'image', date: new Date('2025-07-12'), featured: false },
      { title: 'White Wedding Reception', description: 'Elegant wedding reception', imageUrl: 'https://placehold.co/800x600/f472b6/1a1a2e?text=White+Wedding', thumbnailUrl: 'https://placehold.co/400x300/f472b6/1a1a2e?text=Wedding', category: 'weddings', type: 'image', date: new Date('2025-02-14'), featured: true },
      { title: 'Business Summit', description: 'Executive business summit', imageUrl: 'https://placehold.co/800x600/06b6d4/1a1a2e?text=Business+Summit', thumbnailUrl: 'https://placehold.co/400x300/06b6d4/1a1a2e?text=Summit', category: 'conferences', type: 'image', date: new Date('2025-11-08'), featured: false },
      { title: 'Music Festival', description: 'Outdoor music festival', imageUrl: 'https://placehold.co/800x600/22c55e/1a1a2e?text=Music+Festival', thumbnailUrl: 'https://placehold.co/400x300/22c55e/1a1a2e?text=Festival', category: 'concerts', type: 'image', date: new Date('2025-12-20'), featured: false },
    ]);
    console.log(`  ${galleryItems.length} gallery items created`);

    console.log('Seeding FAQs...');
    const faqs = await FAQ.create([
      { question: 'How do I book MC Adarkwah for my event?', answer: 'Simply fill out the booking form on our website or contact us via phone, email, or WhatsApp. We will get back to you within 24 hours to discuss your event requirements and availability.', category: 'booking', order: 1 },
      { question: 'How far in advance should I book?', answer: 'We recommend booking at least 2-3 months in advance for major events. However, we do accommodate last-minute bookings subject to availability.', category: 'booking', order: 2 },
      { question: 'What is the pricing structure?', answer: 'Pricing varies depending on the event type, duration, location, and requirements. We offer competitive rates and customized packages. Contact us for a personalized quote.', category: 'pricing', order: 3 },
      { question: 'Does MC Adarkwah travel for events?', answer: 'Yes! MC Adarkwah is available for events across Ghana and internationally. Travel and accommodation expenses may apply for events outside Accra.', category: 'booking', order: 4 },
      { question: 'What types of events does MC Adarkwah host?', answer: 'Corporate events, weddings, conferences, concerts, product launches, awards nights, church programs, private events, and special ceremonies.', category: 'events', order: 5 },
      { question: 'How long does MC Adarkwah typically host?', answer: 'Most events range from 4-8 hours. We are flexible and can work with your event schedule, whether it is a 2-hour ceremony or a full-day conference.', category: 'events', order: 6 },
      { question: 'Does MC Adarkwah provide her own sound system?', answer: 'We do not provide sound equipment, but we work closely with your event\'s technical team to ensure optimal sound quality and stage setup.', category: 'booking', order: 7 },
      { question: 'Can we meet MC Adarkwah before the event?', answer: 'Absolutely! We schedule a pre-event consultation meeting (in-person or virtual) to understand your event, discuss the program, and ensure everything runs smoothly.', category: 'booking', order: 8 },
      { question: 'What is MC Adarkwah\'s cancellation policy?', answer: 'Cancellations made 30+ days before the event receive a full refund. 14-30 days receive 50% refund. Less than 14 days, the booking fee is non-refundable.', category: 'pricing', order: 9 },
      { question: 'Does MC Adarkwah offer emcee training or coaching?', answer: 'Yes! MC Adarkwah offers private coaching and mentoring for aspiring emcees and public speakers. Contact us for details.', category: 'events', order: 10 },
    ]);
    console.log(`  ${faqs.length} FAQs created`);

    console.log('Seeding news...');
    const newsItems = await NewsItem.create([
      { title: 'MC Adarkwah to Host 2026 Ghana Corporate Excellence Awards', excerpt: 'We are thrilled to announce that MC Adarkwah has been selected as the official host for the 2026 Ghana Corporate Excellence Awards.', content: 'Full content here...', imageUrl: 'https://placehold.co/800x400/e0b354/1a1a2e?text=Awards+Announcement', category: 'Announcements', author: 'MC Adarkwah Team', tags: ['awards', 'corporate', 'announcement'], featured: true },
      { title: 'Hosting Tips: How to Keep Your Audience Engaged', excerpt: 'Professional insights from MC Adarkwah on keeping any audience captivated from start to finish.', content: 'Full content here...', imageUrl: 'https://placehold.co/800x400/0ea5e9/1a1a2e?text=Hosting+Tips', category: 'Blog', author: 'MC Adarkwah', tags: ['tips', 'hosting', 'engagement'], featured: true },
      { title: 'Behind the Scenes: A Day with MC Adarkwah', excerpt: 'Ever wondered what goes into preparing for a major event? Follow MC Adarkwah through a typical event day.', content: 'Full content here...', imageUrl: 'https://placehold.co/800x400/8b5cf6/1a1a2e?text=Behind+the+Scenes', category: 'Behind the Scenes', author: 'MC Adarkwah Team', tags: ['behind-the-scenes', 'preparation'], featured: false },
    ]);
    console.log(`  ${newsItems.length} news items created`);

    console.log('Seeding sponsors...');
    const sponsors = await Sponsor.create([
      { name: 'MTN Ghana', logo: 'https://placehold.co/150x50/ffcc00/000000?text=MTN', website: 'https://mtn.com.gh', order: 1 },
      { name: 'Ghana Tourism Authority', logo: 'https://placehold.co/150x50/22c55e/ffffff?text=GTA', website: 'https://ghana.travel', order: 2 },
      { name: 'Accra International Conference Centre', logo: 'https://placehold.co/150x50/0ea5e9/ffffff?text=AICC', website: 'https://aicc.com.gh', order: 3 },
      { name: 'Kempinski Hotel', logo: 'https://placehold.co/150x50/8b5cf6/ffffff?text=Kempinski', website: 'https://kempinski.com', order: 4 },
      { name: 'Starlink Ghana', logo: 'https://placehold.co/150x50/1a1a2e/ffffff?text=Starlink', website: 'https://starlink.com', order: 5 },
      { name: 'EventPro Ghana', logo: 'https://placehold.co/150x50/e0b354/1a1a2e?text=EventPro', website: 'https://eventpro.com.gh', order: 6 },
    ]);
    console.log(`  ${sponsors.length} sponsors created`);

    console.log('\nSeed completed successfully!');
    console.log('Admin login: admin@mcadarkwah.com / Admin123!');
    console.log('API docs: http://localhost:5000/api-docs');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
