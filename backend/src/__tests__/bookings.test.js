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
const { validBooking } = require('./helpers/factories');

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

const mockBookings = [
  {
    _id: '507f1f77bcf86cd799439011',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    eventType: 'Wedding',
    eventDate: new Date('2026-12-25'),
    status: 'pending',
  },
];

jest.mock('../models/Booking', () => mockModel({
  create: jest.fn().mockImplementation(d =>
    Promise.resolve({
      _id: '507f1f77bcf86cd799439011',
      ...d,
      status: 'pending',
      save: jest.fn().mockResolvedValue(undefined),
      toObject: () => ({ ...d, status: 'pending' }),
    })
  ),
  find: jest.fn().mockReturnValue(mockQuery(mockBookings)),
  findByIdAndUpdate: jest.fn().mockImplementation((id, update) =>
    Promise.resolve({ _id: id, ...mockBookings[0], ...update, toObject: () => ({ ...mockBookings[0], ...update }) })
  ),
  findByIdAndDelete: jest.fn().mockResolvedValue(mockBookings[0]),
  countDocuments: jest.fn().mockResolvedValue(1),
}));

const request = require('supertest');
const app = require('../app');

describe('Bookings API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/bookings', () => {
    test('creates booking with valid data', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send(validBooking());
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    test('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({ email: 'john@test.com' });
      expect(res.status).toBe(400);
    });

    test('rejects invalid eventDate', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send(validBooking({ eventDate: 'not-a-date' }));
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/bookings', () => {
    test('lists bookings when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app).get('/api/bookings');
      expect(res.status).toBe(401);
    });

    test('filters by status', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .get('/api/bookings?status=pending')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/bookings/:id/status', () => {
    test('updates booking status when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .patch('/api/bookings/507f1f77bcf86cd799439011/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'confirmed' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .patch('/api/bookings/507f1f77bcf86cd799439011/status')
        .send({ status: 'confirmed' });
      expect(res.status).toBe(401);
    });

    test('rejects invalid status', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .patch('/api/bookings/507f1f77bcf86cd799439011/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid-status' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    test('deletes booking when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .delete('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .delete('/api/bookings/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
    });
  });
});
