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
const { validGalleryItem } = require('./helpers/factories');

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

const mockItems = [
  { _id: '507f1f77bcf86cd799439011', title: 'Photo 1', category: 'weddings', type: 'image' },
  { _id: '507f1f77bcf86cd799439012', title: 'Photo 2', category: 'concerts', type: 'image' },
];

jest.mock('../models/GalleryItem', () => mockModel({
  find: jest.fn().mockReturnValue(mockQuery(mockItems)),
  findOne: jest.fn().mockReturnValue(mockQuery(mockItems[0])),
  findById: jest.fn().mockReturnValue(mockQuery(mockItems[0])),
  findByIdAndUpdate: jest.fn().mockImplementation((id, update) =>
    Promise.resolve({ _id: id, ...mockItems[0], ...update, toObject: () => ({ ...mockItems[0], ...update }) })
  ),
  findByIdAndDelete: jest.fn().mockResolvedValue(mockItems[0]),
}));

const request = require('supertest');
const app = require('../app');

describe('Gallery API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/gallery', () => {
    test('returns gallery items', async () => {
      const res = await request(app).get('/api/gallery');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('filters by category', async () => {
      const res = await request(app).get('/api/gallery?category=weddings');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('filters by featured', async () => {
      const res = await request(app).get('/api/gallery?featured=true');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/gallery/:id', () => {
    test('returns single gallery item', async () => {
      const res = await request(app).get('/api/gallery/507f1f77bcf86cd799439011');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    test('returns 404 for non-existent item', async () => {
      const GalleryItem = require('../models/GalleryItem');
      GalleryItem.findById.mockReturnValue(mockQuery(null));
      const res = await request(app).get('/api/gallery/nonexistentid');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/gallery', () => {
    test('creates item when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .post('/api/gallery')
        .set('Authorization', `Bearer ${token}`)
        .send(validGalleryItem());
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .post('/api/gallery')
        .send(validGalleryItem());
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/gallery/:id', () => {
    test('updates item when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .put('/api/gallery/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .put('/api/gallery/507f1f77bcf86cd799439011')
        .send({ title: 'Updated Title' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/gallery/:id', () => {
    test('deletes item when authenticated', async () => {
      const token = createAuthToken();
      const res = await request(app)
        .delete('/api/gallery/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .delete('/api/gallery/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
    });
  });
});
