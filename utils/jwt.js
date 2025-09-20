const jwt = require('jsonwebtoken');

const accessSecret = process.env.JWT_ACCESS_SECRET || 'accesssecret';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refreshsecret';

function signAccess(payload, expiresIn = '15m') {
  return jwt.sign(payload, accessSecret, { expiresIn });
}
function signRefresh(payload, expiresIn = '7d') {
  return jwt.sign(payload, refreshSecret, { expiresIn });
}
function verifyAccess(token) { return jwt.verify(token, accessSecret); }
function verifyRefresh(token) { return jwt.verify(token, refreshSecret); }

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };