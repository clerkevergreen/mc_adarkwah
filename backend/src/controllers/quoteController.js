const Quote = require('../models/Quote');
const { sendQuoteNotification, sendQuoteConfirmation, sendQuoteStatusUpdate } = require('../utils/email');

exports.createQuote = async (req, res, next) => {
  try {
    const quote = await Quote.create(req.body);

    sendQuoteNotification(quote);
    sendQuoteConfirmation(quote);

    res.status(201).json({ success: true, data: quote, message: 'Quote request received. We will get back to you within 24 hours.' });
  } catch (error) {
    next(error);
  }
};

exports.getQuotes = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const quotes = await Quote.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Quote.countDocuments(query);

    res.json({
      success: true,
      data: quotes,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const quote = await Quote.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });

    sendQuoteStatusUpdate(quote);

    res.json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
    res.json({ success: true, message: 'Quote deleted' });
  } catch (error) {
    next(error);
  }
};
