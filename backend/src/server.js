require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const net = require('net');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middleware/errorHandler');
const { sanitizeQuery, sanitizeBody } = require('./middleware/sanitize');

const app = express();

// Connect DB
connectDB();

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

/* =========================
   SMTP DEBUG ROUTE (ADDED)
========================= */
app.get('/api/smtp-debug', (req, res) => {
  const result = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    userExists: !!process.env.SMTP_USER,
    passExists: !!process.env.SMTP_PASS,
    contactExists: !!process.env.CONTACT_EMAIL
  };

  res.json(result);
});

/* =========================
   SMTP CONNECTION TEST (ADDED)
========================= */
app.get('/api/smtp-test-connection', (req, res) => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT);

  const socket = new net.Socket();
  socket.setTimeout(5000);

  socket.on('connect', () => {
    res.json({ success: true, message: 'Connected to SMTP server' });
    socket.destroy();
  });

  socket.on('error', (err) => {
    res.json({ success: false, error: err.message });
  });

  socket.on('timeout', () => {
    res.json({ success: false, error: 'Connection timeout' });
    socket.destroy();
  });

  socket.connect(port, host);
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

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`MC Adarkwah API running on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});