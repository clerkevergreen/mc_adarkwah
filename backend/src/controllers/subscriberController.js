const Subscriber = require('../models/Subscriber');

exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already subscribed' });
    }
    await Subscriber.create({ email });
    res.status(201).json({ success: true, message: 'Successfully subscribed to our newsletter!' });
  } catch (error) { next(error); }
};

exports.getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json({ success: true, data: subscribers });
  } catch (error) { next(error); }
};

exports.deleteSubscriber = async (req, res, next) => {
  try {
    const sub = await Subscriber.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscriber not found' });
    res.json({ success: true, message: 'Subscriber deleted' });
  } catch (error) { next(error); }
};
