const Booking = require('../models/Booking');
const { generateContract } = require('../utils/pdfGenerator');

exports.lookup = async (req, res, next) => {
  try {
    const { email, referenceCode } = req.body;
    if (!email || !referenceCode) {
      return res.status(400).json({ success: false, message: 'Email and reference code are required' });
    }

    const booking = await Booking.findOne({
      email: email.toLowerCase().trim(),
      referenceCode: referenceCode.trim().toUpperCase(),
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found. Check your email and reference code.' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

exports.downloadContract = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const pdfBuffer = await generateContract(booking);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="contract-${booking.referenceCode}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
