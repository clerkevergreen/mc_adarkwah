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
    const adminName = process.env.ADMIN_NAME || 'MC Adarkwah';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mcadarkwah.com';
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('  ERROR: ADMIN_PASSWORD environment variable is required for seeding.');
      console.error('  Set it in backend/.env or export it before running npm run seed.');
      process.exit(1);
    }
    const admin = await Admin.create({ name: adminName, email: adminEmail, password: adminPassword, role: 'superadmin' });
    console.log(`  Admin created: ${admin.email}`);

    console.log('Seeding events...');
    console.log('  Skipped — awaiting owner verification of event details.');
    const events = [];

    console.log('Seeding testimonials...');
    console.log('  Skipped — awaiting real client testimonials with owner approval. Placeholder data retained with isApproved=false for admin review.');
    const testimonials = await Testimonial.create([
      { name: 'Sarah Mensah', photo: 'https://placehold.co/100x100/e0b354/1a1a2e?text=SM', eventName: 'Corporate Gala Night 2025', rating: 5, review: 'PLACEHOLDER — awaiting real testimonial from owner.', designation: 'Event Director, MTN Ghana', isApproved: false },
      { name: 'Kwame Asante', photo: 'https://placehold.co/100x100/e0b354/1a1a2e?text=KA', eventName: 'Traditional Wedding', rating: 5, review: 'PLACEHOLDER — awaiting real testimonial from owner.', designation: 'Groom', isApproved: false },
      { name: 'Dr. Akua Ofori', photo: 'https://placehold.co/100x100/e0b354/1a1a2e?text=AO', eventName: 'Pan-African Health Summit', rating: 5, review: 'PLACEHOLDER — awaiting real testimonial from owner.', designation: 'Conference Chair, WHO Africa', isApproved: false },
      { name: 'James Appiah', photo: 'https://placehold.co/100x100/e0b354/1a1a2e?text=JA', eventName: 'Product Launch', rating: 5, review: 'PLACEHOLDER — awaiting real testimonial from owner.', designation: 'CEO, TechStart Ghana', isApproved: false },
      { name: 'Nana Ama', photo: 'https://placehold.co/100x100/e0b354/1a1a2e?text=NA', eventName: 'Awards Night', rating: 5, review: 'PLACEHOLDER — awaiting real testimonial from owner.', designation: 'Board Member, Ghana Events Awards', isApproved: false },
    ]);
    console.log(`  ${testimonials.length} testimonials created (hidden from public — isApproved=false)`);

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
      {
        title: 'MC Adarkwah to Host 2026 Ghana Corporate Excellence Awards',
        excerpt: 'We are thrilled to announce that MC Adarkwah has been selected as the official host for the 2026 Ghana Corporate Excellence Awards.',
        content: `We are thrilled to announce that MC Adarkwah has been selected as the official host for the 2026 Ghana Corporate Excellence Awards. This prestigious ceremony celebrates outstanding achievements in Ghana's corporate sector, recognizing businesses and leaders who have demonstrated exceptional performance and innovation.

[NEEDS CONFIRMATION: Event date, specific venue, and organizing body or awarding institution — please verify with the owner before publication.]

As one of Ghana's most sought-after masters of ceremony, MC Adarkwah brings professionalism, energy, and stage presence to every event she hosts. Her experience includes corporate galas, international conferences, weddings, concerts, and high-profile celebrations — making her a versatile and trusted choice for this ceremony.

The awards night program includes red carpet arrivals, multiple award categories recognizing excellence across industries, live performances, and a networking reception for Ghana's business community. MC Adarkwah's role encompasses red carpet commentary, award presentations, audience engagement, and ensuring the evening flows seamlessly.

[NEEDS CONFIRMATION: Add quotes from the event organizers, specific award categories, confirmed sponsors, broadcast partners, ticket information, or VIP guests once provided by the owner.]`,
        imageUrl: 'https://placehold.co/800x400/e0b354/1a1a2e?text=Awards+Announcement',
        category: 'Announcements',
        author: 'MC Adarkwah Team',
        tags: ['awards', 'corporate', 'announcement'],
        featured: true,
      },
      {
        title: 'Hosting Tips: How to Keep Your Audience Engaged',
        excerpt: 'Professional insights from MC Adarkwah on keeping any audience captivated from start to finish.',
        content: `A great MC does more than announce speakers and read from a script. The best hosts set the tone, read the room, and keep the energy flowing from the first word to the final farewell. Here are five essential tips for keeping any audience engaged.

1. Know Your Audience Before You Step On Stage
Every audience is different. A corporate board meeting demands a different energy than a wedding reception or a music festival. Research your attendees beforehand — understand the demographics, the occasion, and the mood you need to set. When you speak directly to who is in the room, your audience feels seen and connected.

2. Master the Opening
The first sixty seconds on stage set the tone for everything that follows. Start with a genuine, warm welcome. Acknowledge the venue, the occasion, and any special guests. A well-placed moment of humour or a thoughtful observation about the event can break the ice and make the audience receptive to what comes next.

3. Keep Transitions Tight
Dead air and awkward pauses are the enemy of engagement. Prepare transition lines between segments that recap what just happened and build anticipation for what is next. A simple "What an incredible presentation — let us keep that energy going as we welcome our next speaker" maintains momentum and signals professionalism.

4. Read the Room and Adapt
No matter how well you plan, live events are unpredictable. The best MCs stay flexible. If the audience seems restless after a long session, shorten your introductions. If a speaker runs long, adjust your tone to make the revised schedule feel intentional rather than rushed.

5. Close with Impact
The closing moments of an event are what attendees remember most. Summarise the key takeaways, thank the organisers and participants sincerely, and leave the audience with a final thought that resonates. A strong close turns a good event into an unforgettable one.`,
        imageUrl: 'https://placehold.co/800x400/0ea5e9/1a1a2e?text=Hosting+Tips',
        category: 'Blog',
        author: 'MC Adarkwah',
        tags: ['tips', 'hosting', 'engagement'],
        featured: true,
      },
      {
        title: 'Behind the Scenes: A Day with MC Adarkwah',
        excerpt: 'Ever wondered what goes into preparing for a major event? Follow MC Adarkwah through a typical event day.',
        content: `Every major event looks effortless from the audience side, but the work behind the curtain starts long before the first guest arrives. Here is a look at what a typical event day looks like.

6:00 AM — Preparation
The day starts early. Voice warm-ups, a final review of the event script and running order, and a equipment check. Every event is different, so preparation is tailored to the specific occasion — corporate gala, wedding, conference, or concert.

7:30 AM — Venue Arrival
Arriving well before guests allows time to walk the stage, test audio equipment, coordinate with the technical team, and study the layout. Understanding the space — where speakers will stand, how the lighting works, where the audience will be seated — is critical to a seamless performance.

9:00 AM — Final Coordination Meeting
A quick meeting with the event organiser to confirm any last-minute changes. Guest list updates, speaker substitutions, timing adjustments — every detail is noted and incorporated.

[NEEDS CONFIRMATION: Specific venue names, recent event examples, notable guest anecdotes, or memorable moments can be added once the owner provides details.]

11:00 AM — The Event Begins
From the opening welcome to the final farewell, every moment on stage counts. The goal is to make every speaker look good, every transition feel natural, and every guest feel valued. It requires focus, energy, and genuine care for the success of the event.

4:00 PM — Post-Event Debrief
After the event wraps, a debrief with the organising team covers what went well and what could be improved. Every event is a learning opportunity that makes the next one even better.

[NEEDS CONFIRMATION: Specific time durations, number of guests, or venue names for examples can be filled in with real event data when available.]`,
        imageUrl: 'https://placehold.co/800x400/8b5cf6/1a1a2e?text=Behind+the+Scenes',
        category: 'Behind the Scenes',
        author: 'MC Adarkwah Team',
        tags: ['behind-the-scenes', 'preparation'],
        featured: false,
      },
    ]);
    console.log(`  ${newsItems.length} news items created`);

    console.log('Seeding sponsors...');
    console.log('  Skipped — awaiting owner confirmation of sponsorship relationships.');
    const sponsors = [];

    console.log('\nSeed completed successfully!');
    console.log(`  Admin: ${adminEmail}`);
    console.log('  Password: [set via ADMIN_PASSWORD env var]');
    console.log('https://mc-adarkwah.onrender.com');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
