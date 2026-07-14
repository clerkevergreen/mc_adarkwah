const jwt = require('jsonwebtoken');

function createAuthToken(adminId) {
  const id = adminId || '507f1f77bcf86cd799439011';
  const secret = process.env.JWT_SECRET || 'test-jwt-secret-default';
  return jwt.sign({ id }, secret, { expiresIn: '1h' });
}

module.exports = { createAuthToken };
