const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

exports.auth = {
  setup: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate,
  ],
  register: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate,
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  forgotPassword: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    validate,
  ],
  resetPassword: [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate,
  ],
  refresh: [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validate,
  ],
};

exports.booking = {
  create: [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('eventType').trim().notEmpty().withMessage('Event type is required'),
    body('eventDate').isISO8601().withMessage('Valid event date is required'),
    body('eventLocation').optional().trim(),
    body('guestCount').optional().isInt({ min: 1 }).withMessage('Guest count must be a positive number'),
    body('budgetRange').optional().trim(),
    body('additionalNotes').optional().trim(),
    body('agreeToTerms').optional().isBoolean(),
    validate,
  ],
  statusUpdate: [
    param('id').isMongoId().withMessage('Invalid booking ID'),
    body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status'),
    validate,
  ],
};

exports.contact = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('subject').optional().trim(),
    body('message').trim().notEmpty().withMessage('Message is required'),
    validate,
  ],
};

exports.quote = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('eventType').trim().notEmpty().withMessage('Event type is required'),
    body('eventDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid event date'),
    body('guestCount').optional().isInt({ min: 1 }).withMessage('Guest count must be a positive number'),
    body('message').optional().trim(),
    validate,
  ],
  statusUpdate: [
    param('id').isMongoId().withMessage('Invalid quote ID'),
    body('status').isIn(['pending', 'contacted', 'closed']).withMessage('Invalid status'),
    validate,
  ],
};

exports.subscriber = {
  create: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    validate,
  ],
};

exports.registration = {
  create: [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('event').isMongoId().withMessage('Valid event ID is required'),
    body('message').optional().trim(),
    validate,
  ],
  statusUpdate: [
    param('id').isMongoId().withMessage('Invalid registration ID'),
    body('status').isIn(['pending', 'confirmed', 'cancelled']).withMessage('Invalid status'),
    validate,
  ],
};

exports.event = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('description').optional().trim(),
    body('shortDescription').optional().trim(),
    body('venue').optional().trim(),
    body('location').optional().trim(),
    body('city').optional().trim(),
    body('attendeeCount').optional().isInt({ min: 0 }),
    body('bannerImage').optional().trim(),
    body('thumbnailImage').optional().trim(),
    body('ticketUrl').optional().trim(),
    body('registrationUrl').optional().trim(),
    body('highlights').optional().isArray(),
    body('tags').optional().isArray(),
    body('isUpcoming').optional().isBoolean(),
    body('isFeatured').optional().isBoolean(),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid event ID'),
    body('title').optional().trim().notEmpty(),
    body('category').optional().trim().notEmpty(),
    body('date').optional().isISO8601(),
    body('description').optional().trim(),
    body('shortDescription').optional().trim(),
    body('venue').optional().trim(),
    body('location').optional().trim(),
    body('city').optional().trim(),
    body('attendeeCount').optional().isInt({ min: 0 }),
    body('bannerImage').optional().trim(),
    body('thumbnailImage').optional().trim(),
    body('ticketUrl').optional().trim(),
    body('registrationUrl').optional().trim(),
    body('highlights').optional().isArray(),
    body('tags').optional().isArray(),
    body('isUpcoming').optional().isBoolean(),
    body('isFeatured').optional().isBoolean(),
    body('slug').not().exists().withMessage('Slug cannot be manually set'),
    validate,
  ],
  toggleFeature: [
    param('id').isMongoId().withMessage('Invalid event ID'),
    validate,
  ],
};

exports.gallery = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('imageUrl').optional().trim(),
    body('category').optional().trim(),
    body('type').optional().isIn(['image', 'video']),
    body('description').optional().trim(),
    body('featured').optional().isBoolean(),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid gallery ID'),
    body('title').optional().trim().notEmpty(),
    body('imageUrl').optional().trim(),
    body('category').optional().trim(),
    body('type').optional().isIn(['image', 'video']),
    body('description').optional().trim(),
    body('featured').optional().isBoolean(),
    validate,
  ],
};

exports.service = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('shortDescription').optional().trim(),
    body('description').optional().trim(),
    body('icon').optional().trim(),
    body('imageUrl').optional().trim(),
    body('priceRange').optional().trim(),
    body('features').optional().isArray(),
    body('order').optional().isInt({ min: 0 }),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid service ID'),
    body('title').optional().trim().notEmpty(),
    body('shortDescription').optional().trim(),
    body('description').optional().trim(),
    body('icon').optional().trim(),
    body('imageUrl').optional().trim(),
    body('priceRange').optional().trim(),
    body('features').optional().isArray(),
    body('order').optional().isInt({ min: 0 }),
    validate,
  ],
};

exports.testimonial = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('review').trim().notEmpty().withMessage('Review is required'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('eventName').optional().trim(),
    body('photo').optional().trim(),
    body('designation').optional().trim(),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid testimonial ID'),
    body('name').optional().trim().notEmpty(),
    body('review').optional().trim().notEmpty(),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('eventName').optional().trim(),
    body('photo').optional().trim(),
    body('designation').optional().trim(),
    body('isApproved').optional().isBoolean(),
    validate,
  ],
};

exports.faq = {
  create: [
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('answer').trim().notEmpty().withMessage('Answer is required'),
    body('category').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid FAQ ID'),
    body('question').optional().trim().notEmpty(),
    body('answer').optional().trim().notEmpty(),
    body('category').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    validate,
  ],
  reorder: [
    body('orders').isArray({ min: 1 }).withMessage('Orders array is required'),
    body('orders.*.id').isMongoId().withMessage('Invalid FAQ ID in orders'),
    body('orders.*.order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    validate,
  ],
};

exports.news = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('excerpt').optional().trim(),
    body('imageUrl').optional().trim(),
    body('category').optional().trim(),
    body('author').optional().trim(),
    body('tags').optional().isArray(),
    body('featured').optional().isBoolean(),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid news ID'),
    body('title').optional().trim().notEmpty(),
    body('content').optional().trim().notEmpty(),
    body('excerpt').optional().trim(),
    body('imageUrl').optional().trim(),
    body('category').optional().trim(),
    body('author').optional().trim(),
    body('tags').optional().isArray(),
    body('featured').optional().isBoolean(),
    body('slug').not().exists().withMessage('Slug cannot be manually set'),
    validate,
  ],
};

exports.sponsor = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('logo').optional().trim(),
    body('website').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid sponsor ID'),
    body('name').optional().trim().notEmpty(),
    body('logo').optional().trim(),
    body('website').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    validate,
  ],
};

exports.hero = {
  update: [
    body('badge').optional().trim(),
    body('title').optional().trim(),
    body('subtitle').optional().trim(),
    body('primaryBtnText').optional().trim(),
    body('primaryBtnAction').optional().trim(),
    body('secondaryBtnText').optional().trim(),
    body('secondaryBtnAction').optional().trim(),
    body('isActive').optional().isBoolean(),
    validate,
  ],
};

exports.nav = {
  create: [
    body('label').trim().notEmpty().withMessage('Label is required'),
    body('path').optional().trim(),
    body('fragment').optional().trim(),
    body('icon').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean(),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid nav item ID'),
    body('label').optional().trim().notEmpty(),
    body('path').optional().trim(),
    body('fragment').optional().trim(),
    body('icon').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean(),
    validate,
  ],
};

exports.video = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('url').trim().notEmpty().withMessage('URL is required'),
    body('thumbnail').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean(),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid video ID'),
    body('title').optional().trim().notEmpty(),
    body('url').optional().trim().notEmpty(),
    body('thumbnail').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean(),
    validate,
  ],
};

exports.statistic = {
  create: [
    body('label').trim().notEmpty().withMessage('Label is required'),
    body('value').isInt({ min: 0 }).withMessage('Value must be a positive integer'),
    body('suffix').optional().trim(),
    body('icon').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid statistic ID'),
    body('label').optional().trim().notEmpty(),
    body('value').optional().isInt({ min: 0 }),
    body('suffix').optional().trim(),
    body('icon').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    validate,
  ],
};

exports.profile = {
  update: [
    body('name').optional().trim(),
    body('title').optional().trim(),
    body('bio').optional().trim(),
    body('fullBio').optional().trim(),
    body('image').optional().trim(),
    body('image2').optional().trim(),
    body('yearsExperience').optional().isInt({ min: 0 }),
    body('exchangeRate').optional().isFloat({ min: 0 }),
    validate,
  ],
};

exports.idParam = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];
