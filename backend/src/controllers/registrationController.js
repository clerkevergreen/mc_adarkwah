const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const { sendRegistrationConfirmed, sendRegistrationAdminNotification } = require('../utils/email');

exports.createRegistration = async (req, res, next) => {
  try {
    const { fullName, email, phone, event: eventId, message } = req.body;
    const registration = await EventRegistration.create({ fullName, email, phone, event: eventId, message });

    const eventDoc = await Event.findById(registration.event).select('title date venue time');
    sendRegistrationAdminNotification(registration, eventDoc);

    res.status(201).json({ success: true, data: registration, message: 'Registration successful!' });
  } catch (error) {
    next(error);
  }
};

exports.getRegistrations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const registrations = await EventRegistration.find(query)
      .populate('event', 'title slug date venue')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await EventRegistration.countDocuments(query);

    res.json({
      success: true,
      data: registrations,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getRegistrationsByEvent = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({ event: req.params.eventId })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: registrations });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const registration = await EventRegistration.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('event', 'title date venue time');
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

    if (status === 'confirmed') {
      sendRegistrationConfirmed(registration, registration.event);
    }

    res.json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
};

exports.deleteRegistration = async (req, res, next) => {
  try {
    const registration = await EventRegistration.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });
    res.json({ success: true, message: 'Registration deleted' });
  } catch (error) {
    next(error);
  }
};
