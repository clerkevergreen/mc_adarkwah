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
const { validContact } = require('./helpers/factories');

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

const mockMessages = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Smith',
    email: 'john@test.com',
    subject: 'Booking Inquiry',
    message: 'I want to book your services.',
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Jane Doe',
    email: 'jane@test.com',
    message: 'Great work!',
  },
];

jest.mock('../models/ContactMessage', () => mockModel({
  find: jest.fn().mockReturnValue(mockQuery(mockMessages)),
  findByIdAndDelete: jest.fn().mockResolvedValue(mockMessages[0]),
  countDocuments: jest.fn().mockResolvedValue(2),
}));

const request = require('supertest');
const app = require('../app');

describe('Contact API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/contact', () => {
    test('sends message with valid data', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send(validContact());
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    test('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'John' });
      expect(res.status).toBe(400);
    });

    test('rejects invalid email', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send(validContact({ email: 'not-an-email' }));
      expect(res.status).toBe(400);
    });

    test('rejects empty message', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'John', email: 'john@test.com', message: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/contact', () => {
    test('lists messages when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .get('/api/contact')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app).get('/api/contact');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/contact/:id', () => {
    test('deletes message when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .delete('/api/contact/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .delete('/api/contact/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
    });
  });
});
