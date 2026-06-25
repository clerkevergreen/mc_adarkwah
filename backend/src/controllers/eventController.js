const Event = require('../models/Event');
const slugify = require('slugify');

exports.getEvents = async (req, res, next) => {
  try {
    const { category, year, location, isUpcoming, isFeatured, search, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (year) {
      const y = parseInt(year);
      query.date = { $gte: new Date(y, 0, 1), $lte: new Date(y, 11, 31) };
    }
    if (location) query.$or = [{ city: { $regex: location, $options: 'i' } }, { location: { $regex: location, $options: 'i' } }];
    if (isUpcoming !== undefined) query.isUpcoming = isUpcoming === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const events = await Event.find(query).sort({ date: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getEventBySlug = async (req, res, next) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now();
    if (data.date) data.date = new Date(data.date);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (data.attendeeCount) data.attendeeCount = parseInt(data.attendeeCount);

    const event = await Event.create(data);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.date) data.date = new Date(data.date);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (data.attendeeCount) data.attendeeCount = parseInt(data.attendeeCount);
    delete data.slug;

    const event = await Event.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.toggleFeature = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    event.isFeatured = !event.isFeatured;
    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};
