require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const frontendDist = path.join(__dirname, '../../mc-adarkwa/dist/mc-adarkwa/browser');
app.use(express.static(frontendDist));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

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

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'MC Adarkwah API is running', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MC Adarkwah API running on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});
