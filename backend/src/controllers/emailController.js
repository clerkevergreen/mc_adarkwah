const EmailLog = require('../models/EmailLog');
const { sendEmail } = require('../utils/email');

exports.getLogs = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await EmailLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await EmailLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const [sent, failed] = await Promise.all([
      EmailLog.countDocuments({ status: 'sent' }),
      EmailLog.countDocuments({ status: 'failed' }),
    ]);

    res.json({ success: true, data: { sent, failed, total: sent + failed } });
  } catch (error) {
    next(error);
  }
};

exports.sendTest = async (req, res, next) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ success: false, message: 'Recipient email is required' });

    const result = await sendEmail({
      to,
      subject: 'Test Email - MC Adarkwah',
      type: 'test',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border:1px solid #d4a84b;border-radius:12px;">
          <h1 style="color:#d4a84b;font-family:Georgia,serif;text-align:center;">MC Adarkwah</h1>
          <p style="text-align:center;color:#999;">Email Test</p>
          <hr style="border-color:#333;">
          <p>If you're reading this, the email system is working correctly.</p>
          <p style="color:#999;font-size:0.8rem;">Sent: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    if (result) {
      res.json({ success: true, message: 'Test email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send test email. Check SMTP configuration.' });
    }
  } catch (error) {
    next(error);
  }
};
