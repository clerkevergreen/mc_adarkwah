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
const { validTestimonial } = require('./helpers/factories');

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

const mockTestimonials = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'Jane Doe',
    review: 'Amazing MC!',
    rating: 5,
    isApproved: true,
    save: jest.fn().mockResolvedValue(true),
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'John Smith',
    review: 'Great event!',
    rating: 4,
    isApproved: false,
    save: jest.fn().mockResolvedValue(true),
  },
];

jest.mock('../models/Testimonial', () => mockModel({
  find: jest.fn().mockReturnValue(mockQuery(mockTestimonials.filter(t => t.isApproved))),
  findById: jest.fn().mockReturnValue(mockQuery(mockTestimonials[0])),
  findByIdAndUpdate: jest.fn().mockImplementation((id, update) => {
    const updated = { ...mockTestimonials[0], ...update };
    return Promise.resolve({ ...updated, toObject: () => updated });
  }),
  findByIdAndDelete: jest.fn().mockResolvedValue(mockTestimonials[0]),
}));

const request = require('supertest');
const app = require('../app');

describe('Testimonials API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/testimonials', () => {
    test('returns approved testimonials by default', async () => {
      const res = await request(app).get('/api/testimonials');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('returns all testimonials when approved filter is false', async () => {
      const Testimonial = require('../models/Testimonial');
      Testimonial.find.mockReturnValue(mockQuery(mockTestimonials));
      const res = await request(app).get('/api/testimonials?approved=false');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/testimonials', () => {
    test('creates testimonial with valid data', async () => {
      const res = await request(app)
        .post('/api/testimonials')
        .send(validTestimonial());
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    test('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/testimonials')
        .send({ name: 'John' });
      expect(res.status).toBe(400);
    });

    test('rejects empty name', async () => {
      const res = await request(app)
        .post('/api/testimonials')
        .send({ name: '', review: 'Great!' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/testimonials/:id', () => {
    test('updates testimonial when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .put('/api/testimonials/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ review: 'Updated review' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .put('/api/testimonials/507f1f77bcf86cd799439011')
        .send({ review: 'Updated review' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/testimonials/:id', () => {
    test('deletes testimonial when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .delete('/api/testimonials/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .delete('/api/testimonials/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/testimonials/:id/approve', () => {
    test('toggles approval when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .patch('/api/testimonials/507f1f77bcf86cd799439011/approve')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .patch('/api/testimonials/507f1f77bcf86cd799439011/approve');
      expect(res.status).toBe(401);
    });
  });
});
