const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendPasswordResetEmail } = require('../utils/email');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });
};

exports.getSetupStatus = async (req, res, next) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) {
      return res.status(400).json({ success: false, message: 'Admin already exists. Please login instead.' });
    }
    res.json({ success: true, message: 'Setup required' });
  } catch (error) {
    next(error);
  }
};

exports.setup = async (req, res, next) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) {
      return res.status(400).json({ success: false, message: 'Admin already exists. Please login instead.' });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const admin = await Admin.create({ name, email, password, role: 'superadmin' });
    const token = generateToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    res.status(201).json({
      success: true,
      data: { admin, token, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }

    const admin = await Admin.create({ name, email, password });
    const token = generateToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    res.status(201).json({
      success: true,
      data: { admin, token, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    res.json({
      success: true,
      data: { admin, token, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'No admin found with that email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    admin.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await admin.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'https://mc-adarkwah.onrender.com'}/admin/reset-password/${resetToken}`;

      try {
        await sendPasswordResetEmail(admin.email, resetUrl);
        res.json({ success: true, message: 'Password reset link sent to your email', data: { resetUrl } });
      } catch (err) {
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        await admin.save({ validateBeforeSave: false });
        return res.status(500).json({ success: false, message: 'Failed to send email: ' + err.message });
      }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
    }

    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    const jwtToken = generateToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    res.json({
      success: true,
      message: 'Password reset successful',
      data: { token: jwtToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.admin });
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }

    const token = generateToken(admin._id);
    const newRefreshToken = generateRefreshToken(admin._id);

    res.json({ success: true, data: { token, refreshToken: newRefreshToken } });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};