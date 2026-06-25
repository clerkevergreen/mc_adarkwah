const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your-email@gmail.com') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465',
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    ignoreTLS: true,
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"MC Adarkwah" <${process.env.SMTP_USER || process.env.CONTACT_EMAIL || 'noreply@mcadarkwah.com'}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    if (error.response) console.error('SMTP response:', error.response);
    if (error.code) console.error('Error code:', error.code);
  }
};

const sendBookingConfirmation = async (booking) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid #d4a84b;border-radius:12px;">
      <div style="text-align:center;margin-bottom:2rem;">
        <h1 style="color:#d4a84b;font-family:Georgia,serif;">MC Adarkwah</h1>
        <p style="color:#999;">Booking Confirmation</p>
      </div>
      <h2 style="color:#d4a84b;">Thank You, ${booking.fullName}!</h2>
      <p>Your booking request has been received. Here are your details:</p>
      <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Type</td><td style="padding:8px;border-bottom:1px solid #333;">${booking.eventType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Date</td><td style="padding:8px;border-bottom:1px solid #333;">${new Date(booking.eventDate).toLocaleDateString()}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Location</td><td style="padding:8px;border-bottom:1px solid #333;">${booking.eventLocation || 'TBD'}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Guests</td><td style="padding:8px;border-bottom:1px solid #333;">${booking.guestCount || 'TBD'}</td></tr>
        <tr><td style="padding:8px;color:#999;">Status</td><td style="padding:8px;color:#d4a84b;">Pending Confirmation</td></tr>
      </table>
      <p style="color:#999;">We will get back to you within 24 hours to confirm your booking.</p>
      <p style="color:#999;">For urgent inquiries, call <a href="tel:+447507615314" style="color:#d4a84b;">+44 7507 615314</a> / <a href="tel:+233552917251" style="color:#d4a84b;">+233 55 291 7251</a></p>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="text-align:center;color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: booking.email, subject: 'Booking Confirmation - MC Adarkwah', html });
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
  return sendEmail({ to: process.env.CONTACT_EMAIL, subject: `New Contact: ${contact.subject || 'No Subject'}`, html });
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
  return sendEmail({ to: process.env.CONTACT_EMAIL, subject: `New Booking: ${booking.fullName} - ${booking.eventType}`, html });
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
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Type</td><td style="padding:8px;">${booking.eventType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Event Date</td><td style="padding:8px;">${new Date(booking.eventDate).toLocaleDateString()}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Location</td><td style="padding:8px;">${booking.eventLocation || 'TBD'}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #333;color:#999;">Guests</td><td style="padding:8px;">${booking.guestCount || 'TBD'}</td></tr>
        <tr><td style="padding:8px;color:#999;">Status</td><td style="padding:8px;color:#22c55e;font-weight:bold;">✓ Confirmed</td></tr>
      </table>
      <p style="color:#999;">We look forward to making your event unforgettable. A member of our team will follow up with any additional details.</p>
      <hr style="border-color:#333;margin:2rem 0;">
      <p style="text-align:center;color:#666;font-size:0.8rem;">MC Adarkwah &bull; Professional Master of Ceremonies</p>
    </div>
  `;
  return sendEmail({ to: booking.email, subject: '✓ Booking Confirmed - MC Adarkwah', html });
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
  return sendEmail({ to: process.env.CONTACT_EMAIL, subject: `New Quote Request: ${quote.name} - ${quote.eventType}`, html });
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
  return sendEmail({ to: quote.email, subject: 'Quote Request Received - MC Adarkwah', html });
};

const sendQuoteStatusUpdate = async (quote) => {
  const statusMessages = {
    contacted: 'We have reviewed your event requirements and are preparing a personalized quote. A team member will reach out to you shortly with more details.',
    closed: 'Your quote request has been closed. If you have any further questions, please don\'t hesitate to contact us.',
  };

  const statusBadgeColors = {
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
  return sendEmail({ to: quote.email, subject: `Quote ${quote.status.charAt(0).toUpperCase() + quote.status.slice(1)} - MC Adarkwah`, html });
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
  return sendEmail({ to: process.env.CONTACT_EMAIL, subject: `New Registration: ${registration.fullName} - ${event?.title || 'Event'}`, html });
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
  return sendEmail({ to: registration.email, subject: `✓ Registration Confirmed - ${eventTitle} - MC Adarkwah`, html });
};

module.exports = { sendEmail, sendBookingConfirmation, sendContactNotification, sendAdminNotification, sendBookingConfirmed, sendQuoteNotification, sendQuoteConfirmation, sendQuoteStatusUpdate, sendRegistrationConfirmed, sendRegistrationAdminNotification };
