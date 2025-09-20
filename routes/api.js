const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyAccess } = require('../utils/jwt');

function ensureSession(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated' });
}

async function ensureJwt(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = verifyAccess(token);
    req.user = await User.findById(payload.sub);
    next();
  } catch (e) { res.status(401).json({ error: 'Invalid token' }); }
}

/**
 * @swagger
 * /private-session:
 *   get:
 *     summary: Access a session-protected route
 *     tags: [Private]
 *     description: Requires a valid session cookie (created after session-based login).
 *     responses:
 *       200:
 *         description: Successful access with session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello user@example.com - session protected
 *       401:
 *         description: Not authenticated (no valid session)
 */
router.get('/private-session', ensureSession, (req, res) => {
  res.json({ message: `Hello ${req.user.email} - session protected` });
});

/**
 * @swagger
 * /private-jwt:
 *   get:
 *     summary: Access a JWT-protected route
 *     tags: [Private]
 *     description: Requires a valid Bearer token in the `Authorization` header.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful access with JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello user@example.com - jwt protected
 *       401:
 *         description: Not authenticated (missing or invalid token)
 */
router.get('/private-jwt', ensureJwt, (req, res) => {
  res.json({ message: `Hello ${req.user.email} - jwt protected` });
});

module.exports = router;