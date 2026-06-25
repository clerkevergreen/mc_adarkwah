const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Testimonial = require('../models/Testimonial');
const ContactMessage = require('../models/ContactMessage');
const Subscriber = require('../models/Subscriber');

exports.getStats = async (req, res, next) => {
  try {
    const [totalEvents, upcomingEvents, pastEvents, totalBookings, pendingBookings, confirmedBookings, totalTestimonials, approvedTestimonials, totalContacts, totalSubscribers, recentBookings, eventsByCategory] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ isUpcoming: true }),
      Event.countDocuments({ isUpcoming: false }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Testimonial.countDocuments(),
      Testimonial.countDocuments({ isApproved: true }),
      ContactMessage.countDocuments(),
      Subscriber.countDocuments(),
      Booking.find().sort({ createdAt: -1 }).limit(5).lean(),
      Event.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalEvents, upcomingEvents, pastEvents,
        totalBookings, pendingBookings, confirmedBookings,
        totalTestimonials, approvedTestimonials,
        totalContacts, totalSubscribers,
        recentBookings,
        eventsByCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};
