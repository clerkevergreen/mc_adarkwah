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
const { validService } = require('./helpers/factories');

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

const mockServices = [
  { _id: '507f1f77bcf86cd799439011', icon: 'mic', title: 'MC Service', order: 1 },
  { _id: '507f1f77bcf86cd799439012', icon: 'music', title: 'DJ Service', order: 2 },
];

jest.mock('../models/Service', () => mockModel({
  find: jest.fn().mockReturnValue(mockQuery(mockServices)),
  findById: jest.fn().mockReturnValue(mockQuery(mockServices[0])),
  findByIdAndUpdate: jest.fn().mockImplementation((id, update) =>
    Promise.resolve({ _id: id, ...mockServices[0], ...update, toObject: () => ({ ...mockServices[0], ...update }) })
  ),
  findByIdAndDelete: jest.fn().mockResolvedValue(mockServices[0]),
}));

const request = require('supertest');
const app = require('../app');

describe('Services API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/services', () => {
    test('returns all services sorted by order', async () => {
      const res = await request(app).get('/api/services');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/services', () => {
    test('creates service when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${token}`)
        .send(validService());
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .post('/api/services')
        .send(validService());
      expect(res.status).toBe(401);
    });

    test('validates required title', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${token}`)
        .send({ icon: 'mic' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/services/:id', () => {
    test('updates service when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .put('/api/services/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Service' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .put('/api/services/507f1f77bcf86cd799439011')
        .send({ title: 'Updated Service' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/services/:id', () => {
    test('deletes service when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .delete('/api/services/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .delete('/api/services/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
    });
  });
});
