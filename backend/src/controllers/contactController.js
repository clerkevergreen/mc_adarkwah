const ContactMessage = require('../models/ContactMessage');
const { sendContactNotification } = require('../utils/email');

exports.createMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message: msgText } = req.body;
    const message = await ContactMessage.create({ name, email, subject, message: msgText });

    sendContactNotification(message);
    res.status(201).json({ success: true, data: message, message: 'Your message has been received. We will get back to you soon.' });
  } catch (error) { next(error); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) { next(error); }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) { next(error); }
};
