const Availability = require('../models/Availability');
const Booking = require('../models/Booking');

exports.getAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const availability = await Availability.find(query).sort({ date: 1 });
    res.json({ success: true, count: availability.length, data: availability });
  } catch (error) {
    next(error);
  }
};

exports.blockDates = async (req, res, next) => {
  try {
    const { dates, reason } = req.body;
    const operations = dates.map(date => ({
      updateOne: {
        filter: { date: new Date(date) },
        update: { $set: { date: new Date(date), status: 'blocked', reason: reason || '' } },
        upsert: true,
      },
    }));
    await Availability.bulkWrite(operations);
    const blocked = await Availability.find({ date: { $in: dates.map(d => new Date(d)) } }).sort({ date: 1 });
    res.status(201).json({ success: true, count: blocked.length, data: blocked });
  } catch (error) {
    next(error);
  }
};

exports.unblockDate = async (req, res, next) => {
  try {
    const entry = await Availability.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Availability entry not found' });
    res.json({ success: true, message: 'Date unblocked' });
  } catch (error) {
    next(error);
  }
};

exports.getAllBlocks = async (req, res, next) => {
  try {
    const blocks = await Availability.find({ status: { $in: ['blocked', 'booked'] } }).sort({ date: 1 });
    res.json({ success: true, count: blocks.length, data: blocks });
  } catch (error) {
    next(error);
  }
};

exports.syncBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ status: { $in: ['confirmed', 'pending'] } }).select('eventDate');
    const operations = bookings.map(b => ({
      updateOne: {
        filter: { date: b.eventDate },
        update: { $set: { date: b.eventDate, status: 'booked', booking: b._id } },
        upsert: true,
      },
    }));
    if (operations.length > 0) await Availability.bulkWrite(operations);
    res.json({ success: true, message: `${operations.length} bookings synced to availability` });
  } catch (error) {
    next(error);
  }
};
