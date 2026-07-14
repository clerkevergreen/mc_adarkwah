require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const net = require('net');
const swaggerSpec = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middleware/errorHandler');
const { sanitizeQuery, sanitizeBody } = require('./middleware/sanitize');

const app = express();

/* =========================
   CORS CONFIG (FIXED)
========================= */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:4200',
  'https://mc-adarkwah.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  credentials: true,
}));

/* =========================
   SECURITY HEADERS
========================= */
app.use(helmet());

/* =========================
   QUERY SANITIZATION
========================= */
app.use(sanitizeQuery);

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', sanitizeBody);

/* =========================
   UPLOADS (FIXED FOR RENDER)
========================= */
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

/* =========================
   API DOCS
========================= */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

/* =========================
   API ROUTES
========================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/faqs', require('./routes/faqs'));
app.use('/api/news', require('./routes/news'));
app.use('/api/sponsors', require('./routes/sponsors'));
app.use('/api/subscribers', require('./routes/subscribers'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/statistics', require('./routes/statistics'));
app.use('/api/hero', require('./routes/hero'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/nav', require('./routes/nav'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/portal', require('./routes/portal'));
app.use('/api/email', require('./routes/email'));

/* =========================
   SMTP DIAGNOSTIC
========================= */
const tryTcpConnect = (host, port, timeout = 8000) => {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => { socket.destroy(); resolve(); });
    socket.on('error', (err) => { socket.destroy(); reject(err); });
    socket.on('timeout', () => { socket.destroy(); reject(new Error('Connection timeout')); });
    socket.connect(port, host);
  });
};

app.get('/api/smtp-diagnose', async (req, res) => {
  const host = process.env.SMTP_HOST;
  const configPort = parseInt(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const steps = [];

  // Step 1: Config check
  steps.push({
    step: 'Configuration',
    details: {
      host,
      port: configPort,
      user: user || '(not set)',
      passLength: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0,
      contactEmail: process.env.CONTACT_EMAIL || '(not set)',
      isDefaultUser: user === 'your-email@gmail.com',
    },
  });

  if (!host || !user || user === 'your-email@gmail.com') {
    steps.push({ step: 'DNS Lookup', status: 'skipped', reason: 'SMTP not configured' });
    steps.push({ step: 'TCP Connect', status: 'skipped', reason: 'SMTP not configured' });
    steps.push({ step: 'SMTP Auth', status: 'skipped', reason: 'SMTP not configured' });
    return res.json({ success: false, steps });
  }

  // Step 2: DNS lookup
  try {
    const addresses = await new Promise((resolve, reject) => {
      require('dns').resolve4(host, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    steps.push({ step: 'DNS Lookup', status: 'ok', details: { addresses } });
  } catch (err) {
    steps.push({ step: 'DNS Lookup', status: 'fail', error: err.message });
    return res.json({ success: false, steps });
  }

  // Step 3: TCP connection — try configured port, then fallback to 587
  const portsToTry = configPort === 587 ? [587] : [configPort, 587];
  let connectedPort = null;
  let tcpError = null;

  for (const p of portsToTry) {
    try {
      await tryTcpConnect(host, p);
      connectedPort = p;
      break;
    } catch (err) {
      tcpError = err.message;
    }
  }

  if (connectedPort) {
    steps.push({ step: 'TCP Connect', status: 'ok', details: { host, port: connectedPort, note: connectedPort !== configPort ? `Used fallback port ${connectedPort} (configured: ${configPort})` : undefined } });
  } else {
    steps.push({ step: 'TCP Connect', status: 'fail', error: tcpError });
    return res.json({ success: false, steps });
  }

  // Step 4: SMTP handshake + auth
  const authPortsToTry = connectedPort ? [connectedPort] : [configPort, 587];
  let authResult = null;
  let authError = null;

  for (const p of authPortsToTry) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host,
        port: p,
        secure: p === 465,
        requireTLS: p === 587,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        auth: { user, pass: process.env.SMTP_PASS },
      });
      authResult = await transporter.verify();
      steps.push({
        step: 'SMTP Auth',
        status: 'ok',
        details: { host, port: p, verifyResult: authResult, note: p !== configPort ? `Used port ${p} (configured: ${configPort})` : undefined },
      });
      return res.json({ success: true, steps });
    } catch (err) {
      authError = { message: err.message, code: err.code, command: err.command, response: err.response, responseCode: err.responseCode };
    }
  }

  steps.push({
    step: 'SMTP Auth',
    status: 'fail',
    error: authError.message,
    code: authError.code,
    command: authError.command,
    response: authError.response,
    responseCode: authError.responseCode,
  });
  res.json({ success: false, steps });
});

/* =========================
   HEALTH CHECK
========================= */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MC Adarkwah API is running',
    timestamp: new Date().toISOString()
  });
});

/* =========================
   ANGULAR FRONTEND (FIXED)
========================= */
const frontendPath = path.join(__dirname, '../../dist/mc-adarkwa/browser');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

/* =========================
   ERROR HANDLER
========================= */
app.use(errorHandler);

module.exports = app;
