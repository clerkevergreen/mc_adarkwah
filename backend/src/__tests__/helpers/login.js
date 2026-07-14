const { createAuthToken } = require('./createAdmin');

function loginAsAdmin(adminId) {
  const token = createAuthToken(adminId);
  return `Bearer ${token}`;
}

module.exports = { loginAsAdmin };
