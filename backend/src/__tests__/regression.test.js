const { mockQuery, mockModel } = require('./helpers/mockFactory');

/* =========================================================================
   MODEL MOCKS — hoisted before any require() so controllers see fake DB
   ========================================================================= */

/* --- Email: prevent SMTP connections --- */
jest.mock('../utils/email', () => {
  const mockNoopEmail = jest.fn().mockResolvedValue(false);
  return {
    sendEmail: mockNoopEmail,
    sendPasswordResetEmail: mockNoopEmail,
    sendBookingConfirmation: mockNoopEmail,
    sendAdminNotification: mockNoopEmail,
    sendBookingConfirmed: mockNoopEmail,
    sendQuoteNotification: mockNoopEmail,
    sendQuoteConfirmation: mockNoopEmail,
    sendQuoteStatusUpdate: mockNoopEmail,
    sendRegistrationAdminNotification: mockNoopEmail,
    sendRegistrationConfirmed: mockNoopEmail,
    sendContactNotification: mockNoopEmail,
  };
});

/* --- Admin: pretend DB returns a valid admin for all lookups --- */
const mockAdminDoc = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'superadmin',
  comparePassword: jest.fn().mockResolvedValue(true),
  getSignedJwtToken: jest.fn().mockReturnValue('jwt-token'),
  getSignedRefreshToken: jest.fn().mockReturnValue('refresh-token'),
  save: jest.fn().mockResolvedValue(undefined),
  toObject: () => ({ name: 'Admin User', email: 'admin@example.com', role: 'superadmin' }),
};

jest.mock('../models/Admin', () => mockModel({
  countDocuments: jest.fn().mockResolvedValue(0),
  findOne: jest.fn().mockReturnValue(mockQuery(mockAdminDoc)),
  findById: jest.fn().mockReturnValue(mockQuery(mockAdminDoc)),
}));

/* --- All other models: default mock (create/find/count all return empty) --- */
jest.mock('../models/Booking', () => mockModel());
jest.mock('../models/EventRegistration', () => mockModel());
jest.mock('../models/Event', () => mockModel());
jest.mock('../models/Testimonial', () => mockModel());
jest.mock('../models/ContactMessage', () => mockModel());
jest.mock('../models/Quote', () => mockModel());
jest.mock('../models/Subscriber', () => mockModel());
jest.mock('../models/GalleryItem', () => mockModel());
jest.mock('../models/Service', () => mockModel());
jest.mock('../models/FAQ', () => mockModel());
jest.mock('../models/NewsItem', () => mockModel());
jest.mock('../models/Sponsor', () => mockModel());
jest.mock('../models/Profile', () => mockModel());
jest.mock('../models/Statistic', () => mockModel());
jest.mock('../models/HeroContent', () => mockModel());
jest.mock('../models/VideoHighlight', () => mockModel());
jest.mock('../models/NavItem', () => mockModel());

/* =========================================================================
   IMPORTS
   ========================================================================= */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

/* =========================================================================
   TESTS
   ========================================================================= */
describe('API Regression Test Plan — Phase 1 Verification', () => {
  /* ====================================================================
     [1] VALID INPUT  —  Happy path (middleware passes, controllers succeed)
     ==================================================================== */
  describe('[1] Valid Input — Happy Path', () => {
    test('[1.1] POST /api/auth/setup → 201', async () => {
      const res = await request(app)
        .post('/api/auth/setup')
        .send({ name: 'Admin User', email: 'admin@example.com', password: 'password123' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('[1.2] POST /api/auth/login → 200', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.3] POST /api/auth/forgot-password → 200', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'admin@example.com' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.4] POST /api/auth/reset-password → 200', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'valid-reset-token', password: 'newpassword123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.5] POST /api/auth/refresh → 200', async () => {
      const validToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
      );
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: validToken });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.6] POST /api/bookings → 201', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          eventType: 'Wedding',
          eventDate: '2026-12-25',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('[1.7] POST /api/registrations → 201', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .send({
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+1234567890',
          event: '507f1f77bcf86cd799439011',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('[1.8] POST /api/testimonials → 201', async () => {
      const res = await request(app)
        .post('/api/testimonials')
        .send({ name: 'Jane Doe', review: 'Amazing MC! Highly recommend.' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('[1.9] POST /api/contact → 201', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'John', email: 'john@example.com', message: 'I would like to book your services.' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('[1.10] POST /api/quotes → 201', async () => {
      const res = await request(app)
        .post('/api/quotes')
        .send({ name: 'John', email: 'john@example.com', phone: '+1234567890', eventType: 'Corporate' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('[1.11] POST /api/subscribers → 201', async () => {
      const res = await request(app)
        .post('/api/subscribers')
        .send({ email: 'subscriber@example.com' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    /* --- Public GET endpoints that read data --- */
    test('[1.12] GET /api/health → 200', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.13] GET /api/events → 200', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.14] GET /api/gallery → 200', async () => {
      const res = await request(app).get('/api/gallery');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.15] GET /api/services → 200', async () => {
      const res = await request(app).get('/api/services');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.16] GET /api/testimonials → 200', async () => {
      const res = await request(app).get('/api/testimonials');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.17] GET /api/faqs → 200', async () => {
      const res = await request(app).get('/api/faqs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.18] GET /api/news → 200', async () => {
      const res = await request(app).get('/api/news');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.19] GET /api/sponsors → 200', async () => {
      const res = await request(app).get('/api/sponsors');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.20] GET /api/profile → 200', async () => {
      const res = await request(app).get('/api/profile');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.21] GET /api/statistics → 200', async () => {
      const res = await request(app).get('/api/statistics');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.22] GET /api/hero → 200', async () => {
      const res = await request(app).get('/api/hero');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.23] GET /api/videos → 200', async () => {
      const res = await request(app).get('/api/videos');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.24] GET /api/nav → 200', async () => {
      const res = await request(app).get('/api/nav');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.25] GET /api/auth/setup → 200 (setup not completed)', async () => {
      const res = await request(app).get('/api/auth/setup');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('[1.26] GET /api/smtp-debug → 200', async () => {
      const res = await request(app).get('/api/smtp-debug');
      expect(res.status).toBe(200);
    });
  });

  /* ====================================================================
     [2] INVALID INPUT  —  express-validator catches bad data
     ==================================================================== */
  describe('[2] Invalid Input — Validation Rejection', () => {
    const expectValidationError = (res) => {
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
    };

    test('[2.1] POST /api/auth/login — bad email format → 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'password123' });
      expectValidationError(res);
    });

    test('[2.2] POST /api/auth/setup — bad email → 400', async () => {
      const res = await request(app)
        .post('/api/auth/setup')
        .send({ name: 'Admin', email: 'bad', password: 'password123' });
      expectValidationError(res);
    });

    test('[2.3] POST /api/auth/reset-password — short password → 400', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'sometoken', password: '12345' });
      expectValidationError(res);
    });

    test('[2.4] POST /api/bookings — invalid eventDate → 400', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({ fullName: 'John', email: 'john@test.com', phone: '123', eventType: 'Wedding', eventDate: 'not-a-date' });
      expectValidationError(res);
    });

    test('[2.5] POST /api/registrations — invalid event ObjectId → 400', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .send({ fullName: 'Jane', email: 'jane@test.com', phone: '123', event: 'not-a-valid-id' });
      expectValidationError(res);
    });

    test('[2.6] POST /api/testimonials — empty name → 400', async () => {
      const res = await request(app)
        .post('/api/testimonials')
        .send({ name: '', review: 'Great!' });
      expectValidationError(res);
    });

    test('[2.7] POST /api/contact — invalid email → 400', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'John', email: 'bad-email', message: 'Hello' });
      expectValidationError(res);
    });

    test('[2.8] POST /api/quotes — invalid email → 400', async () => {
      const res = await request(app)
        .post('/api/quotes')
        .send({ name: 'John', email: 'bad', phone: '123', eventType: 'Wedding' });
      expectValidationError(res);
    });

    test('[2.9] POST /api/subscribers — invalid email → 400', async () => {
      const res = await request(app)
        .post('/api/subscribers')
        .send({ email: 'not-an-email' });
      expectValidationError(res);
    });

    test('[2.10] POST /api/auth/forgot-password — invalid email → 400', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: '' });
      expectValidationError(res);
    });

    test('[2.11] POST /api/auth/refresh — empty refreshToken → 400', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: '' });
      expectValidationError(res);
    });
  });

  /* ====================================================================
     [3] MISSING REQUIRED FIELDS
     ==================================================================== */
  describe('[3] Missing Required Fields', () => {
    const expectMissingError = (res) => {
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    };

    test('[3.1] POST /api/auth/setup — missing name → 400', async () => {
      const res = await request(app)
        .post('/api/auth/setup')
        .send({ email: 'admin@example.com', password: 'password123' });
      expectMissingError(res);
    });

    test('[3.2] POST /api/auth/login — missing email → 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });
      expectMissingError(res);
    });

    test('[3.3] POST /api/auth/login — missing password → 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com' });
      expectMissingError(res);
    });

    test('[3.4] POST /api/bookings — missing fullName → 400', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({ email: 'john@test.com', phone: '123', eventType: 'Wedding', eventDate: '2026-12-25' });
      expectMissingError(res);
    });

    test('[3.5] POST /api/bookings — missing email → 400', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({ fullName: 'John', phone: '123', eventType: 'Wedding', eventDate: '2026-12-25' });
      expectMissingError(res);
    });

    test('[3.6] POST /api/registrations — missing email → 400', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .send({ fullName: 'Jane', phone: '123', event: '507f1f77bcf86cd799439011' });
      expectMissingError(res);
    });

    test('[3.7] POST /api/testimonials — missing review → 400', async () => {
      const res = await request(app)
        .post('/api/testimonials')
        .send({ name: 'John' });
      expectMissingError(res);
    });

    test('[3.8] POST /api/contact — missing message → 400', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'John', email: 'john@test.com' });
      expectMissingError(res);
    });

    test('[3.9] POST /api/quotes — missing phone → 400', async () => {
      const res = await request(app)
        .post('/api/quotes')
        .send({ name: 'John', email: 'john@test.com', eventType: 'Wedding' });
      expectMissingError(res);
    });

    test('[3.10] POST /api/quotes — missing name → 400', async () => {
      const res = await request(app)
        .post('/api/quotes')
        .send({ email: 'john@test.com', phone: '123', eventType: 'Wedding' });
      expectMissingError(res);
    });

    test('[3.11] POST /api/contact — missing name → 400', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ email: 'john@test.com', message: 'Hello' });
      expectMissingError(res);
    });
  });

  /* ====================================================================
     [4] MALFORMED MongoDB OPERATORS  —  sanitize strips  $ne/$gt/$regex/...
     ==================================================================== */
  describe('[4] Malformed MongoDB Operators — Sanitization', () => {
    const expectSafe = (res) => {
      expect([200, 201, 400]).toContain(res.status);
      expect(res.body.success).toBeDefined();
    };

    test('[4.1] GET /api/events?status[$ne]=pending — $ne stripped → no crash', async () => {
      const res = await request(app).get('/api/events?status[$ne]=pending');
      expectSafe(res);
    });

    test('[4.2] GET /api/services?title[$regex]=.* — $regex stripped → no crash', async () => {
      const res = await request(app).get('/api/services?title[$regex]=.*');
      expectSafe(res);
    });

    test('[4.3] GET /api/events?category[$where]=1 — $where stripped → no crash', async () => {
      const res = await request(app).get('/api/events?category[$where]=1');
      expectSafe(res);
    });

    test('[4.4] GET /api/testimonials?rating[$gte]=3 — $gte stripped → no crash', async () => {
      const res = await request(app).get('/api/testimonials?rating[$gte]=3');
      expectSafe(res);
    });

    test('[4.5] GET /api/news?title[$regex]=. — $regex in query → no crash', async () => {
      const res = await request(app).get('/api/news?title[$regex]=.');
      expectSafe(res);
    });

    test('[4.6] GET /api/events?year[$gt]=2024 — $gt stripped → no crash', async () => {
      const res = await request(app).get('/api/events?year[$gt]=2024');
      expectSafe(res);
    });

    test('[4.7] POST /api/bookings with body operator → still succeeds (operator stripped, valid fields pass)', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          fullName: 'Test',
          email: 'test@test.com',
          phone: '123',
          eventType: 'Wedding',
          eventDate: '2026-12-25',
          status: { $ne: 'confirmed' },
        });
      expect(res.status).toBe(201);
    });

    test('[4.8] GET /api/events?$where=1 — top-level $where stripped', async () => {
      const res = await request(app).get('/api/events?$where=1');
      expectSafe(res);
    });

    test('[4.9] GET /api/gallery?$ne=1 — top-level $ne stripped', async () => {
      const res = await request(app).get('/api/gallery?$ne=1');
      expectSafe(res);
    });
  });

  /* ====================================================================
     [5] UNAUTHORIZED ACCESS — protected endpoints without a token
     ==================================================================== */
  describe('[5] Unauthorized Access', () => {
    const protectedEndpoints = [
      ['GET', '/api/auth/me'],
      ['POST', '/api/auth/register'],
      ['GET', '/api/bookings'],
      ['PATCH', '/api/bookings/507f1f77bcf86cd799439011/status'],
      ['DELETE', '/api/bookings/507f1f77bcf86cd799439011'],
      ['POST', '/api/events'],
      ['PUT', '/api/events/507f1f77bcf86cd799439011'],
      ['DELETE', '/api/events/507f1f77bcf86cd799439011'],
      ['PATCH', '/api/events/507f1f77bcf86cd799439011/toggle-feature'],
      ['POST', '/api/gallery'],
      ['PUT', '/api/gallery/507f1f77bcf86cd799439011'],
      ['DELETE', '/api/gallery/507f1f77bcf86cd799439011'],
      ['POST', '/api/services'],
      ['PUT', '/api/services/507f1f77bcf86cd799439011'],
      ['DELETE', '/api/services/507f1f77bcf86cd799439011'],
      ['POST', '/api/faqs'],
      ['PUT', '/api/faqs/507f1f77bcf86cd799439011'],
      ['DELETE', '/api/faqs/507f1f77bcf86cd799439011'],
      ['PUT', '/api/faqs/reorder'],
      ['POST', '/api/news'],
      ['PUT', '/api/news/507f1f77bcf86cd799439011'],
      ['DELETE', '/api/news/507f1f77bcf86cd799439011'],
      ['POST', '/api/sponsors'],
      ['PUT', '/api/sponsors/507f1f77bcf86cd799439011'],
      ['DELETE', '/api/sponsors/507f1f77bcf86cd799439011'],
      ['GET', '/api/subscribers'],
      ['DELETE', '/api/subscribers/507f1f77bcf86cd799439011'],
      ['GET', '/api/contact'],
      ['DELETE', '/api/contact/507f1f77bcf86cd799439011'],
      ['GET', '/api/quotes'],
      ['PATCH', '/api/quotes/507f1f77bcf86cd799439011/status'],
      ['DELETE', '/api/quotes/507f1f77bcf86cd799439011'],
      ['POST', '/api/upload'],
      ['GET', '/api/dashboard'],
      ['PUT', '/api/profile'],
      ['POST', '/api/statistics'],
      ['PUT', '/api/statistics/507f1f77bcf86cd799439011'],
      ['DELETE', '/api/statistics/507f1f77bcf86cd799439011'],
      ['PUT', '/api/hero'],
      ['GET', '/api/videos/all'],
      ['POST', '/api/videos'],
      ['PUT', '/api/videos/507f1f77bcf86cd799439011'],
      ['DELETE', '/api/videos/507f1f77bcf86cd799439011'],
      ['GET', '/api/nav/all'],
      ['POST', '/api/nav'],
      ['PUT', '/api/nav/507f1f77bcf86cd799439011'],
      ['DELETE', '/api/nav/507f1f77bcf86cd799439011'],
    ];

    test.each(protectedEndpoints)('[5.%#] %s %s → 401', async (method, path) => {
      const res = await request(app)
        [method.toLowerCase()](path)
        .set('Authorization', '');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('[5.x] Malformed token → 401', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not-a-real-jwt');
      expect(res.status).toBe(401);
    });

    test('[5.y] JWT with wrong secret → 401', async () => {
      const badToken = jwt.sign({ id: '507f1f77bcf86cd799439011' }, 'wrong-secret');
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${badToken}`)
        .send({ title: 'Test', category: 'Workshop', date: '2026-07-15' });
      expect(res.status).toBe(401);
    });
  });

  /* ====================================================================
     [6] RATE-LIMIT ABUSE —  send (limit + overhead) requests, expect 429
     ==================================================================== */
  describe('[6] Rate-Limit Abuse', () => {
    test('[6.1] POST /api/auth/login — authLimiter (10/15min) → blocks excess', async () => {
      const results = [];
      for (let i = 0; i < 15; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: `rate${i}@test.com`, password: 'password123' });
        results.push(res.status);
      }
      const blocked = results.filter(s => s === 429).length;
      expect(blocked).toBeGreaterThanOrEqual(1);
    }, 30000);

    test('[6.2] POST /api/quotes — quoteLimiter (5/15min) → blocks excess', async () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .post('/api/quotes')
          .send({ name: `Q${i}`, email: `q${i}@test.com`, phone: '1234567890', eventType: 'Wedding' });
        results.push(res.status);
      }
      const blocked = results.filter(s => s === 429).length;
      expect(blocked).toBeGreaterThanOrEqual(1);
    }, 30000);

    test('[6.3] POST /api/subscribers — subscribeLimiter (10/60min) → blocks excess', async () => {
      const results = [];
      for (let i = 0; i < 15; i++) {
        const res = await request(app)
          .post('/api/subscribers')
          .send({ email: `sub${i}@example.com` });
        results.push(res.status);
      }
      const blocked = results.filter(s => s === 429).length;
      expect(blocked).toBeGreaterThanOrEqual(1);
    }, 30000);
  });
});
