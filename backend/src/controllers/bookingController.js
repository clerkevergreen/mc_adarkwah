const Booking = require('../models/Booking');
const { sendBookingConfirmation, sendAdminNotification, sendBookingConfirmed, sendAdminBookingConfirmed, sendBookingCancelled, sendAdminBookingCancelled, sendBookingCompleted, sendAdminBookingCompleted } = require('../utils/email');

exports.createBooking = async (req, res, next) => {
  try {
    const { fullName, email, phone, eventType, eventDate, eventLocation, guestCount, budgetRange, additionalNotes, agreeToTerms } = req.body;
    const booking = await Booking.create({ fullName, email, phone, eventType, eventDate: new Date(eventDate), eventLocation, guestCount: parseInt(guestCount) || 0, budgetRange, additionalNotes, agreeToTerms });

    sendBookingConfirmation(booking);
    sendAdminNotification(booking);

    res.status(201).json({
      success: true,
      data: booking,
      message: `Booking request received. Your reference code is ${booking.referenceCode}. We will contact you within 24 hours.`,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    switch (status) {
      case 'confirmed':
        sendBookingConfirmed(booking);
        sendAdminBookingConfirmed(booking);
        break;
      case 'cancelled':
        sendBookingCancelled(booking);
        sendAdminBookingCancelled(booking);
        break;
      case 'completed':
        sendBookingCompleted(booking);
        sendAdminBookingCompleted(booking);
        break;
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    next(error);
  }
};
