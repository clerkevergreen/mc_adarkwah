require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const timeout = require('connect-timeout');
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
   REQUEST LOGGING
========================= */
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/* =========================
   REQUEST TIMEOUT
========================= */
app.use(timeout('30s'));
app.use((req, res, next) => {
  if (!req.timedout) next();
});

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
   PAYSTACK WEBHOOK (raw body required for signature verification)
========================= */
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  req.body = JSON.parse(req.body);
  next();
}, require('./controllers/paymentController').handleWebhook);

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
app.use('/api/payments', require('./routes/payments'));

/* =========================
   SMTP DIAGNOSTIC
========================= */
app.get('/api/smtp-diagnose', async (req, res) => {
  const sgKey = process.env.SENDGRID_API_KEY;
  const steps = [];

  // Step 1: Config check
  steps.push({
    step: 'Configuration',
    details: {
      sendgridKeySet: !!sgKey,
      sendgridKeyPrefix: sgKey ? sgKey.substring(0, 8) + '...' : '(not set)',
      smtpHost: process.env.SMTP_HOST || '(not set)',
      smtpPort: process.env.SMTP_PORT || '(not set)',
      smtpUser: process.env.SMTP_USER || '(not set)',
      contactEmail: process.env.CONTACT_EMAIL || '(not set)',
    },
  });

  if (!sgKey) {
    steps.push({ step: 'SendGrid', status: 'skipped', reason: 'SENDGRID_API_KEY not set' });
  } else {
    try {
      const https = require('https');
      await new Promise((resolve, reject) => {
        const req = https.get('https://api.sendgrid.com/v3/scopes', {
          headers: { Authorization: `Bearer ${sgKey}` },
        }, (res) => {
          let data = '';
          res.on('data', (c) => data += c);
          res.on('end', () => {
            if (res.statusCode === 200) resolve();
            else reject(new Error(`SendGrid API returned ${res.statusCode}: ${data.substring(0, 200)}`));
          });
        });
        req.on('error', reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('SendGrid API timeout')); });
      });
      steps.push({ step: 'SendGrid', status: 'ok', details: { transport: 'HTTPS (port 443) — bypasses Render port blocks' } });
    } catch (err) {
      steps.push({ step: 'SendGrid', status: 'fail', error: err.message });
      return res.json({ success: false, steps });
    }
  }

  res.json({ success: !!sgKey, steps });
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
