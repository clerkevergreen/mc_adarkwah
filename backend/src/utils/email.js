const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const EmailLog = require('../models/EmailLog');

const fromAddress = `"MC Adarkwah" <${process.env.FROM_EMAIL || process.env.SMTP_USER || process.env.CONTACT_EMAIL || 'noreply@mcadarkwah.com'}>`;

/* ---------- SendGrid (primary) ---------- */

const initSendGrid = () => {
  if (!process.env.SENDGRID_API_KEY) return false;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  return true;
};

const sendViaSendGrid = async (msg) => {
  if (!initSendGrid()) return false;
  await sgMail.send({ ...msg, from: fromAddress });
  return true;
};

/* ---------- SMTP (fallback) ---------- */

const sendViaSmtp = async (msg) => {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com') {
    throw new Error('SMTP not configured');
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const configPort = parseInt(process.env.SMTP_PORT) || 587;
  const portsToTry = configPort === 587 ? [587] : [configPort, 587];
  let lastError = null;

  for (const port of portsToTry) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        requireTLS: port === 587,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      const info = await transporter.sendMail({ ...msg, from: fromAddress });
      if (port !== configPort) {
        console.log(`[EMAIL] Used fallback port ${port} (configured: ${configPort})`);
      }
      return info;
    } catch (err) {
      lastError = err;
      console.warn(`[EMAIL] SMTP port ${port} failed: ${err.message}`);
    }
  }

  throw lastError;
};

/* ---------- Core send ---------- */

const sendEmail = async ({ to, subject, html, type, relatedId }) => {
  const useSendGrid = initSendGrid();

  try {
    let info;

    if (useSendGrid) {
      await sendViaSendGrid({ to, subject, html });
      info = { messageId: 'sendgrid-' + Date.now() };
      console.log(`[EMAIL] Sent via SendGrid to ${to}`);
    } else {
      info = await sendViaSmtp({ to, subject, html });
      console.log(`[EMAIL] Sent via SMTP to ${to}: ${info.messageId}`);
    }

    await EmailLog.create({
      to,
      subject,
      type: type || 'general',
      relatedId: relatedId || null,
      status: 'sent',
      messageId: info.messageId,
    });

    return true;
  } catch (error) {
    const details = {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    };

    console.error(`[EMAIL] FAILED${useSendGrid ? ' (SendGrid)' : ' (SMTP)'}:`, JSON.stringify(details, null, 2));

    await EmailLog.create({
      to,
      subject,
      type: type || 'general',
      relatedId: relatedId || null,
      status: 'failed',
      error: JSON.stringify(details),
    });

    return false;
  }
};

/* ---------- Template helpers ---------- */

const sendBookingConfirmation = async (booking) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid #d4a84b;border-radius:12px;">
      <div style="text-align:center;margin-bottom:2rem;">
        <h1 style="color:#d4a84b;font-family:Georgia,serif;">MC Adarkwah</h1>
        <p style="color:#d4a84b;">Booking Request Pending</p>
      </div>
      <h2 style="color:#d4a84b;">Thank You, ${booking.fullName}!</h2>
      <p>Your booking request has been received. Here are your details:</p>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Type</td><td style="padding:8px;border-bottom:1px solid #333;color:#d4a84b;">${booking.eventType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Date</td><td style="padding:8px;border-bottom:1px solid #333;color:#d4a84b;">${new Date(booking.eventDate).toLocaleDateString()}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Location</td><td style="padding:8px;border-bottom:1px solid #333;color:#d4a84b;">${booking.eventLocation || 'TBD'}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Guests</td><td style="padding:8px;border-bottom:1px solid #333;color:#d4a84b;">${booking.guestCount || 'TBD'}</td></tr>
        <tr><td style="padding:8px;color:#999;">Status</td><td style="padding:8px;color:#d4a84b;font-weight:bold;">Pending Confirmation</td></tr>
      </table>
      <p style="color:#999;">We will get back to you within 24 hours to confirm your booking.</p>
      <p style="color:#999;">For urgent inquiries, call <a href="tel:+447507615314" style="color:#d4a84b;">+44 7507 615314</a> / <a href="tel:+233552917251" style="color:#d4a84b;">+233 55 291 7251</a></p>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="text-align:center;color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: booking.email, subject: 'Booking Pending - MC Adarkwah', html, type: 'booking_pending', relatedId: booking._id });
};

const sendContactNotification = async (contact) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;">
      <h2 style="color:#d4a84b;">New Contact Message</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Subject:</strong> ${contact.subject || 'No subject'}</p>
      <p><strong>Message:</strong></p>
      <p style="color:#999;">${contact.message}</p>
    </div>
  `;
  return sendEmail({ to: process.env.CONTACT_EMAIL, subject: `New Contact: ${contact.subject || 'No Subject'}`, html, type: 'contact_notification' });
};

const sendAdminNotification = async (booking) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;">
      <h2 style="color:#d4a84b;">New Booking Received</h2>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Name</td><td style="padding:8px;">${booking.fullName}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Email</td><td style="padding:8px;">${booking.email}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Phone</td><td style="padding:8px;">${booking.phone}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event</td><td style="padding:8px;">${booking.eventType}</td></tr>
        <tr><td style="padding:8px;color:#999;">Date</td><td style="padding:8px;">${new Date(booking.eventDate).toLocaleDateString()}</td></tr>
      </table>
    </div>
  `;
  return sendEmail({ to: process.env.CONTACT_EMAIL, subject: `New Booking: ${booking.fullName} - ${booking.eventType}`, html, type: 'admin_booking_notification', relatedId: booking._id });
};

const sendBookingConfirmed = async (booking) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid #22c55e;border-radius:12px;">
      <div style="text-align:center;margin-bottom:2rem;">
        <div style="width:60px;height:60px;margin:0 auto 1rem;background:rgba(34,197,94,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 style="color:#d4a84b;font-family:Georgia,serif;">Booking Confirmed!</h1>
      </div>
      <h2 style="color:#22c55e;">Dear ${booking.fullName},</h2>
      <p>Great news! Your booking has been <strong style="color:#22c55e;">confirmed</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Type</td><td style="padding:8px;color:#d4a84b;">${booking.eventType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Date</td><td style="padding:8px;color:#d4a84b;">${new Date(booking.eventDate).toLocaleDateString()}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Location</td><td style="padding:8px;color:#d4a84b;">${booking.eventLocation || 'TBD'}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Guests</td><td style="padding:8px;color:#d4a84b;">${booking.guestCount || 'TBD'}</td></tr>
        <tr><td style="padding:8px;color:#999;">Status</td><td style="padding:8px;color:#d4a84b;font-weight:bold;">✓ Confirmed</td></tr>
      </table>
      <p style="color:#999;">We look forward to making your event unforgettable. A member of our team will follow up with any additional details.</p>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="text-align:center;color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: booking.email, subject: '✓ Booking Confirmed - MC Adarkwah', html, type: 'booking_confirmed', relatedId: booking._id });
};

const sendAdminBookingConfirmed = async (booking) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid #22c55e;border-radius:12px;">
      <div style="text-align:center;margin-bottom:2rem;">
        <h2 style="color:#22c55e;">✓ Booking Confirmed</h2>
      </div>
      <p>You just confirmed a booking from <strong>${booking.fullName}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Name</td><td style="padding:8px;">${booking.fullName}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Email</td><td style="padding:8px;">${booking.email}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Phone</td><td style="padding:8px;">${booking.phone}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event</td><td style="padding:8px;">${booking.eventType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Date</td><td style="padding:8px;">${new Date(booking.eventDate).toLocaleDateString()}</td></tr>
        <tr><td style="padding:8px;color:#999;">Status</td><td style="padding:8px;color:#22c55e;font-weight:bold;">✓ Confirmed</td></tr>
      </table>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: process.env.CONTACT_EMAIL, subject: `✓ Booking Confirmed: ${booking.fullName} - ${booking.eventType}`, html, type: 'admin_booking_confirmed', relatedId: booking._id });
};

const sendAdminBookingCancelled = async (booking) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid #ef4444;border-radius:12px;">
      <div style="text-align:center;margin-bottom:2rem;">
        <h2 style="color:#ef4444;">✕ Booking Cancelled</h2>
      </div>
      <p>You cancelled a booking from <strong>${booking.fullName}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Name</td><td style="padding:8px;">${booking.fullName}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Email</td><td style="padding:8px;">${booking.email}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Phone</td><td style="padding:8px;">${booking.phone}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event</td><td style="padding:8px;">${booking.eventType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Date</td><td style="padding:8px;">${new Date(booking.eventDate).toLocaleDateString()}</td></tr>
        <tr><td style="padding:8px;color:#999;">Status</td><td style="padding:8px;color:#ef4444;font-weight:bold;">✕ Cancelled</td></tr>
      </table>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: process.env.CONTACT_EMAIL, subject: `✕ Booking Cancelled: ${booking.fullName} - ${booking.eventType}`, html, type: 'admin_booking_cancelled', relatedId: booking._id });
};

const sendAdminBookingCompleted = async (booking) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid #a855f7;border-radius:12px;">
      <div style="text-align:center;margin-bottom:2rem;">
        <h2 style="color:#a855f7;">★ Booking Completed</h2>
      </div>
      <p>You marked a booking as completed for <strong>${booking.fullName}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Name</td><td style="padding:8px;">${booking.fullName}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Email</td><td style="padding:8px;">${booking.email}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Phone</td><td style="padding:8px;">${booking.phone}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event</td><td style="padding:8px;">${booking.eventType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Date</td><td style="padding:8px;">${new Date(booking.eventDate).toLocaleDateString()}</td></tr>
        <tr><td style="padding:8px;color:#999;">Status</td><td style="padding:8px;color:#a855f7;font-weight:bold;">★ Completed</td></tr>
      </table>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: process.env.CONTACT_EMAIL, subject: `★ Booking Completed: ${booking.fullName} - ${booking.eventType}`, html, type: 'admin_booking_completed', relatedId: booking._id });
};

const sendBookingCancelled = async (booking) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid #ef4444;border-radius:12px;">
      <div style="text-align:center;margin-bottom:2rem;">
        <div style="width:60px;height:60px;margin:0 auto 1rem;background:rgba(239,68,68,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        <h1 style="color:#d4a84b;font-family:Georgia,serif;">Booking Cancelled</h1>
      </div>
      <h2 style="color:#ef4444;">Dear ${booking.fullName},</h2>
      <p>We regret to inform you that your booking has been <strong style="color:#ef4444;">cancelled</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Type</td><td style="padding:8px;color:#d4a84b;">${booking.eventType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Date</td><td style="padding:8px;color:#d4a84b;">${new Date(booking.eventDate).toLocaleDateString()}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Location</td><td style="padding:8px;color:#d4a84b;">${booking.eventLocation || 'TBD'}</td></tr>
        <tr><td style="padding:8px;color:#999;">Status</td><td style="padding:8px;color:#d4a84b;font-weight:bold;">✕ Cancelled</td></tr>
      </table>
      <p style="color:#999;">If you have any questions, please don't hesitate to contact us. We hope to serve you in the future.</p>
      <p style="color:#999;">For inquiries, call <a href="tel:+447507615314" style="color:#d4a84b;">+44 7507 615314</a> / <a href="tel:+233552917251" style="color:#d4a84b;">+233 55 291 7251</a></p>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="text-align:center;color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: booking.email, subject: '✕ Booking Cancelled - MC Adarkwah', html, type: 'booking_cancelled', relatedId: booking._id });
};

const sendBookingCompleted = async (booking) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid #a855f7;border-radius:12px;">
      <div style="text-align:center;margin-bottom:2rem;">
        <div style="width:60px;height:60px;margin:0 auto 1rem;background:rgba(168,85,247,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <h1 style="color:#d4a84b;font-family:Georgia,serif;">Event Completed</h1>
      </div>
      <h2 style="color:#a855f7;">Dear ${booking.fullName},</h2>
      <p>Your event has been marked as <strong style="color:#a855f7;">completed</strong>. Thank you for choosing MC Adarkwah!</p>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Type</td><td style="padding:8px;color:#d4a84b;">${booking.eventType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Date</td><td style="padding:8px;color:#d4a84b;">${new Date(booking.eventDate).toLocaleDateString()}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Location</td><td style="padding:8px;color:#d4a84b;">${booking.eventLocation || 'TBD'}</td></tr>
        <tr><td style="padding:8px;color:#999;">Status</td><td style="padding:8px;color:#d4a84b;font-weight:bold;">★ Completed</td></tr>
      </table>
      <p style="color:#999;">We hope you had a wonderful event! We would love to hear your feedback. Feel free to reach out to us anytime.</p>
      <p style="color:#999;">For inquiries, call <a href="tel:+447507615314" style="color:#d4a84b;">+44 7507 615314</a> / <a href="tel:+233552917251" style="color:#d4a84b;">+233 55 291 7251</a></p>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="text-align:center;color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: booking.email, subject: '★ Event Completed - MC Adarkwah', html, type: 'booking_completed', relatedId: booking._id });
};

const sendQuoteNotification = async (quote) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;">
      <h2 style="color:#d4a84b;">New Quote Request</h2>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Name</td><td style="padding:8px;">${quote.name}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Email</td><td style="padding:8px;">${quote.email}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Phone</td><td style="padding:8px;">${quote.phone}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Type</td><td style="padding:8px;">${quote.eventType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Date</td><td style="padding:8px;">${quote.eventDate ? new Date(quote.eventDate).toLocaleDateString() : 'Not specified'}</td></tr>
        <tr><td style="padding:8px;color:#999;">Message</td><td style="padding:8px;color:#999;">${quote.message || 'No message'}</td></tr>
      </table>
    </div>
  `;
  return sendEmail({ to: process.env.CONTACT_EMAIL, subject: `New Quote Request: ${quote.name} - ${quote.eventType}`, html, type: 'quote_notification', relatedId: quote._id });
};

const sendQuoteConfirmation = async (quote) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid #d4a84b;border-radius:12px;">
      <div style="text-align:center;margin-bottom:2rem;">
        <h1 style="color:#d4a84b;font-family:Georgia,serif;">MC Adarkwah</h1>
        <p style="color:#999;">Quote Request Received</p>
      </div>
      <h2 style="color:#d4a84b;">Thank You, ${quote.name}!</h2>
      <p>Your quote request has been received. Here are the details you provided:</p>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Type</td><td style="padding:8px;border-bottom:1px solid #333;">${quote.eventType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Date</td><td style="padding:8px;border-bottom:1px solid #333;">${quote.eventDate ? new Date(quote.eventDate).toLocaleDateString() : 'Not specified'}</td></tr>
        <tr><td style="padding:8px;color:#999;">Status</td><td style="padding:8px;color:#d4a84b;">Pending Review</td></tr>
      </table>
      <p style="color:#999;">We will review your request and get back to you within 24 hours with a personalized quote.</p>
      <p style="color:#999;">For urgent inquiries, call <a href="tel:+447507615314" style="color:#d4a84b;">+44 7507 615314</a> / <a href="tel:+233552917251" style="color:#d4a84b;">+233 55 291 7251</a></p>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="text-align:center;color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: quote.email, subject: 'Quote Request Received - MC Adarkwah', html, type: 'quote_confirmation', relatedId: quote._id });
};

const sendQuoteStatusUpdate = async (quote) => {
  const statusMessages = {
    pending: 'Your quote request is currently being reviewed. We will get back to you as soon as possible with a personalized quote.',
    contacted: 'We have reviewed your event requirements and are preparing a personalized quote. A team member will reach out to you shortly with more details.',
    closed: 'Your quote request has been closed. If you have any further questions, please don\'t hesitate to contact us.',
  };

  const statusBadgeColors = {
    pending: '#d4a84b',
    contacted: '#a855f7',
    closed: '#9ca3af',
  };

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid ${statusBadgeColors[quote.status] || '#d4a84b'};border-radius:12px;">
      <div style="text-align:center;margin-bottom:2rem;">
        <h1 style="color:#d4a84b;font-family:Georgia,serif;">MC Adarkwah</h1>
        <p style="color:#999;">Quote Status Update</p>
      </div>
      <h2 style="color:#d4a84b;">Dear ${quote.name},</h2>
      <p>${statusMessages[quote.status] || 'Your quote request status has been updated.'}</p>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Type</td><td style="padding:8px;">${quote.eventType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Status</td><td style="padding:8px;color:${statusBadgeColors[quote.status] || '#d4a84b'};font-weight:bold;text-transform:uppercase;">${quote.status}</td></tr>
      </table>
      <p style="color:#999;">For urgent inquiries, call <a href="tel:+447507615314" style="color:#d4a84b;">+44 7507 615314</a> / <a href="tel:+233552917251" style="color:#d4a84b;">+233 55 291 7251</a></p>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="text-align:center;color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: quote.email, subject: `Quote ${quote.status.charAt(0).toUpperCase() + quote.status.slice(1)} - MC Adarkwah`, html, type: 'quote_status_update', relatedId: quote._id });
};

const sendRegistrationAdminNotification = async (registration, event) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;">
      <h2 style="color:#d4a84b;">New Event Registration</h2>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Name</td><td style="padding:8px;">${registration.fullName}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Email</td><td style="padding:8px;">${registration.email}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Phone</td><td style="padding:8px;">${registration.phone}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event</td><td style="padding:8px;">${event?.title || registration.event}</td></tr>
        <tr><td style="padding:8px;color:#999;">Message</td><td style="padding:8px;color:#999;">${registration.message || 'None'}</td></tr>
      </table>
    </div>
  `;
  return sendEmail({ to: process.env.CONTACT_EMAIL, subject: `New Registration: ${registration.fullName} - ${event?.title || 'Event'}`, html, type: 'registration_notification', relatedId: registration._id });
};

const sendRegistrationConfirmed = async (registration, event) => {
  const eventTitle = event?.title || 'Event';
  const eventDate = event?.date ? new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD';
  const eventVenue = event?.venue || 'TBD';
  const eventTime = event?.time || 'TBD';

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid #22c55e;border-radius:12px;">
      <div style="text-align:center;margin-bottom:2rem;">
        <div style="width:60px;height:60px;margin:0 auto 1rem;background:rgba(34,197,94,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 style="color:#d4a84b;font-family:Georgia,serif;">Registration Confirmed!</h1>
      </div>
      <h2 style="color:#22c55e;">Dear ${registration.fullName},</h2>
      <p>Your registration for <strong style="color:#d4a84b;">${eventTitle}</strong> has been <strong style="color:#22c55e;">confirmed</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event</td><td style="padding:8px;">${eventTitle}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Date</td><td style="padding:8px;">${eventDate}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Time</td><td style="padding:8px;">${eventTime}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Venue</td><td style="padding:8px;">${eventVenue}</td></tr>
        <tr><td style="padding:8px;color:#999;">Status</td><td style="padding:8px;color:#22c55e;font-weight:bold;">✓ Confirmed</td></tr>
      </table>
      <p style="color:#999;">We look forward to seeing you at the event. Stay tuned for more updates!</p>
      <p style="color:#999;">For urgent inquiries, call <a href="tel:+447507615314" style="color:#d4a84b;">+44 7507 615314</a> / <a href="tel:+233552917251" style="color:#d4a84b;">+233 55 291 7251</a></p>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="text-align:center;color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: registration.email, subject: `✓ Registration Confirmed - ${eventTitle} - MC Adarkwah`, html, type: 'registration_confirmed', relatedId: registration._id });
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid #d4a84b;border-radius:12px;">
      <div style="text-align:center;margin-bottom:2rem;">
        <h1 style="color:#d4a84b;font-family:Georgia,serif;">MC Adarkwah</h1>
        <p style="color:#999;">Admin Password Reset</p>
      </div>
      <h2 style="color:#d4a84b;">Reset Your Password</h2>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <div style="text-align:center;margin:2rem 0;">
        <a href="${resetUrl}" style="display:inline-block;padding:0.9rem 2rem;background:linear-gradient(135deg,#d4a84b,#b8912e);color:#0a0a0a;text-decoration:none;border-radius:8px;font-weight:600;font-size:1rem;">Reset Password</a>
      </div>
      <p style="color:#999;">This link expires in 1 hour.</p>
      <p style="color:#666;font-size:0.8rem;">If you didn't request this, please ignore this email.</p>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="text-align:center;color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Password Reset - MC Adarkwah Admin', html, type: 'password_reset' });
};

module.exports = { sendEmail, sendBookingConfirmation, sendContactNotification, sendAdminNotification, sendBookingConfirmed, sendAdminBookingConfirmed, sendAdminBookingCancelled, sendAdminBookingCompleted, sendBookingCancelled, sendBookingCompleted, sendQuoteNotification, sendQuoteConfirmation, sendQuoteStatusUpdate, sendRegistrationConfirmed, sendRegistrationAdminNotification, sendPasswordResetEmail };
