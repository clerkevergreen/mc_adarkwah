const axios = require('axios');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API = 'https://api.paystack.co';

exports.initializePayment = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const amount = booking.amount;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'No amount set for this booking. Please contact admin.' });
    }

    const reference = 'PAY-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const response = await axios.post(
      `${PAYSTACK_API}/transaction/initialize`,
      {
        email: booking.email,
        amount: Math.round(amount * 100),
        currency: 'GHS',
        reference,
        callback_url: `${process.env.FRONTEND_URL}/booking/payment?reference=${reference}`,
        metadata: { bookingId: booking._id.toString(), referenceCode: booking.referenceCode },
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' } },
    );

    const payment = await Payment.create({
      booking: booking._id,
      referenceCode: reference,
      amount,
      currency: 'GHS',
      paystackReference: reference,
      paystackAccessCode: response.data.data.access_code,
    });

    res.json({
      success: true,
      data: {
        authorizationUrl: response.data.data.authorization_url,
        reference,
        paymentId: payment._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `${PAYSTACK_API}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } },
    );

    const paystackData = response.data.data;

    if (paystackData.status === 'success') {
      const payment = await Payment.findOneAndUpdate(
        { paystackReference: reference },
        { status: 'success', paidAt: new Date() },
        { new: true },
      );

      if (payment) {
        await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'paid' });
      }
    }

    res.json({
      success: true,
      data: {
        status: paystackData.status,
        amount: paystackData.amount / 100,
        paidAt: paystackData.paid_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.handleWebhook = async (req, res, next) => {
  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(req.rawBody)
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).send('Signature mismatch');
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference } = event.data;

      const payment = await Payment.findOneAndUpdate(
        { paystackReference: reference },
        { status: 'success', paidAt: new Date() },
        { new: true },
      );

      if (payment) {
        const booking = await Booking.findByIdAndUpdate(
          payment.booking,
          { paymentStatus: 'paid' },
          { new: true },
        );

        if (booking && booking.status === 'pending') {
          booking.status = 'confirmed';
          await booking.save();
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
