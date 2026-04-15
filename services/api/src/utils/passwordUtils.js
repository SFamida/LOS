const bcrypt = require('bcryptjs');

// Hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Generate temporary password
function generateTemporaryPassword() {
  return Math.random().toString(36).slice(-8).toUpperCase() + Math.random().toString(36).slice(-2);
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateTemporaryPassword,
};
