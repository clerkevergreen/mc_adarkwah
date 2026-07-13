const express = require('express');
const router = express.Router();
const { getSetupStatus, setup, register, login, forgotPassword, resetPassword, getMe, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         email: { type: string }
 *         role: { type: string }
 *         createdAt: { type: string, format: date-time }
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email }
 *         password: { type: string, format: password }
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         data:
 *           type: object
 *           properties:
 *             admin: { $ref: '#/components/schemas/Admin' }
 *             token: { type: string }
 *             refreshToken: { type: string }
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       201:
 *         description: Admin registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.get('/setup', getSetupStatus);
router.post('/setup', validate.auth.setup, setup);
router.post('/register', protect, validate.auth.register, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post('/login', authLimiter, validate.auth.login, login);
router.post('/forgot-password', authLimiter, validate.auth.forgotPassword, forgotPassword);
router.post('/reset-password', validate.auth.resetPassword, resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current admin profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New tokens
 */
router.post('/refresh', validate.auth.refresh, refreshToken);
router.get('/test-email', async (req, res) => {
  const nodemailer = require('nodemailer');
  const results = {};
  for (const port of [587, 465]) {
    try {
      const t = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        requireTLS: port !== 465,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await t.verify();
      results[port] = 'OK';
    } catch (err) {
      results[port] = err.message;
    }
  }
  const anyOk = Object.values(results).some(v => v === 'OK');
  res.status(anyOk ? 200 : 500).json({ success: anyOk, results });
});

module.exports = router;
