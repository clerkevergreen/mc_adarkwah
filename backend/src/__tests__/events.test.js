jest.mock('../utils/email', () => {
  const noop = jest.fn().mockResolvedValue(true);
  return {
    sendEmail: noop,
    sendPasswordResetEmail: noop,
    sendBookingConfirmation: noop,
    sendAdminNotification: noop,
    sendBookingConfirmed: noop,
    sendQuoteNotification: noop,
    sendQuoteConfirmation: noop,
    sendQuoteStatusUpdate: noop,
    sendRegistrationAdminNotification: noop,
    sendRegistrationConfirmed: noop,
    sendContactNotification: noop,
  };
});

const { mockModel, mockQuery } = require('./helpers/mockFactory');
const { createAuthToken } = require('./helpers/createAdmin');
const { validEvent } = require('./helpers/factories');

const mockAdminDoc = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'superadmin',
  comparePassword: jest.fn().mockResolvedValue(true),
  getSignedJwtToken: jest.fn().mockReturnValue('jwt-token'),
  getSignedRefreshToken: jest.fn().mockReturnValue('refresh-token'),
  save: jest.fn().mockResolvedValue(undefined),
  toObject: () => ({
    _id: '507f1f77bcf86cd799439011',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'superadmin',
  }),
};

jest.mock('../models/Admin', () => mockModel({
  findById: jest.fn().mockReturnValue(mockQuery(mockAdminDoc)),
}));

const mockEvents = [
  {
    _id: '507f1f77bcf86cd799439011',
    title: 'Corporate Gala',
    slug: 'corporate-gala',
    category: 'corporate',
    date: new Date('2026-06-15'),
    isUpcoming: true,
    isFeatured: true,
    save: jest.fn().mockResolvedValue(true),
  },
  {
    _id: '507f1f77bcf86cd799439012',
    title: 'Wedding Ceremony',
    slug: 'wedding-ceremony',
    category: 'wedding',
    date: new Date('2026-08-20'),
    isUpcoming: true,
    isFeatured: false,
    save: jest.fn().mockResolvedValue(true),
  },
];

jest.mock('../models/Event', () => mockModel({
  find: jest.fn().mockReturnValue(mockQuery(mockEvents)),
  findOne: jest.fn().mockReturnValue(mockQuery(mockEvents[0])),
  findById: jest.fn().mockReturnValue(mockQuery(mockEvents[0])),
  findByIdAndUpdate: jest.fn().mockImplementation((id, update) =>
    Promise.resolve({ _id: id, ...mockEvents[0], ...update, toObject: () => ({ ...mockEvents[0], ...update }) })
  ),
  findByIdAndDelete: jest.fn().mockResolvedValue(mockEvents[0]),
  countDocuments: jest.fn().mockResolvedValue(2),
}));

const request = require('supertest');
const app = require('../app');

describe('Events API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/events', () => {
    test('returns list of events', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    test('filters by category', async () => {
      const res = await request(app).get('/api/events?category=corporate');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('filters by year', async () => {
      const res = await request(app).get('/api/events?year=2026');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('filters by isUpcoming', async () => {
      const res = await request(app).get('/api/events?isUpcoming=true');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/events/:slug', () => {
    test('returns event by slug', async () => {
      const res = await request(app).get('/api/events/corporate-gala');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    test('returns 404 for non-existent slug', async () => {
      const Event = require('../models/Event');
      Event.findOne.mockReturnValue(mockQuery(null));
      const res = await request(app).get('/api/events/non-existent');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/events', () => {
    test('creates event when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(validEvent());
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .post('/api/events')
        .send(validEvent());
      expect(res.status).toBe(401);
    });

    test('validates required fields', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/events/:id', () => {
    test('updates event when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .put('/api/events/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Event' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .put('/api/events/507f1f77bcf86cd799439011')
        .send({ title: 'Updated Event' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/events/:id', () => {
    test('deletes event when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .delete('/api/events/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .delete('/api/events/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/events/:id/toggle-feature', () => {
    test('toggles featured status when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .patch('/api/events/507f1f77bcf86cd799439011/toggle-feature')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .patch('/api/events/507f1f77bcf86cd799439011/toggle-feature');
      expect(res.status).toBe(401);
    });
  });
});
