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
  countDocuments: jest.fn().mockResolvedValue(0),
  findOne: jest.fn().mockReturnValue(mockQuery(mockAdminDoc)),
  findById: jest.fn().mockReturnValue(mockQuery(mockAdminDoc)),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Admin = require('../models/Admin');

describe('Auth API', () => {
  beforeEach(() => {
    Admin.findOne.mockReturnValue(mockQuery(mockAdminDoc));
    Admin.findById.mockReturnValue(mockQuery(mockAdminDoc));
    Admin.countDocuments.mockResolvedValue(0);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/setup', () => {
    test('returns setup status when no admin exists', async () => {
      Admin.countDocuments.mockResolvedValue(0);
      const res = await request(app).get('/api/auth/setup');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/setup/i);
    });

    test('returns error when admin already exists', async () => {
      Admin.countDocuments.mockResolvedValue(1);
      const res = await request(app).get('/api/auth/setup');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/setup', () => {
    test('creates first admin successfully', async () => {
      Admin.countDocuments.mockResolvedValue(0);
      const res = await request(app)
        .post('/api/auth/setup')
        .send({ name: 'Admin', email: 'admin@example.com', password: 'password123' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.token).toBeDefined();
    });

    test('rejects setup if admin already exists', async () => {
      Admin.countDocuments.mockResolvedValue(1);
      const res = await request(app)
        .post('/api/auth/setup')
        .send({ name: 'Admin', email: 'admin@example.com', password: 'password123' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('validates required fields', async () => {
      const res = await request(app)
        .post('/api/auth/setup')
        .send({ email: 'admin@example.com' });
      expect(res.status).toBe(400);
    });

    test('validates password length', async () => {
      const res = await request(app)
        .post('/api/auth/setup')
        .send({ name: 'Admin', email: 'admin@example.com', password: '12345' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('login succeeds with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    test('rejects invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'password123' });
      expect(res.status).toBe(400);
    });

    test('rejects missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com' });
      expect(res.status).toBe(400);
    });

    test('rejects invalid credentials', async () => {
      mockAdminDoc.comparePassword.mockResolvedValueOnce(false);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/register', () => {
    test('registers new admin when authenticated', async () => {
      const token = createAuthToken();
      Admin.findOne.mockReturnValue(mockQuery(null));
      Admin.countDocuments.mockResolvedValue(1);
      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Admin', email: 'new@example.com', password: 'password123' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('rejects register without auth', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'New Admin', email: 'new@example.com', password: 'password123' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('sends reset email when admin exists', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'admin@example.com' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('returns 404 when admin not found', async () => {
      Admin.findOne.mockReturnValue(mockQuery(null));
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('resets password with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'valid-reset-token', password: 'newpassword123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects short password', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'sometoken', password: '12345' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('refreshes token with valid refreshToken', async () => {
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
      expect(res.body.data.token).toBeDefined();
    });

    test('rejects invalid refresh token', async () => {
      const badToken = jwt.sign({ id: '507f1f77bcf86cd799439011' }, 'wrong-secret');
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: badToken });
      expect(res.status).toBe(401);
    });

    test('rejects empty refreshToken', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    test('returns admin profile when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    test('rejects without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    test('rejects malformed token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not-a-real-jwt');
      expect(res.status).toBe(401);
    });
  });
});
