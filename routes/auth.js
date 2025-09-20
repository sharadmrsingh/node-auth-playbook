/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');
const sendEmail = require('../utils/mailer');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Bad request
 */
// Local register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash: hash, name });
  req.login(user, err => { if (err) return res.status(500).json({ err }); res.json({ ok: true }); });
});

/**
 * @swagger
 * /auth/session-login:
 *   post:
 *     summary: Login user with session (cookie-based authentication)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully (session cookie set)
 *       401:
 *         description: Invalid credentials
 */
// Local login (session-cookie-based authentication)
router.post('/session-login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'No user' });
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) return res.status(400).json({ error: 'Invalid' });
  req.login(user, err => { if (err) return res.status(500).json({ err }); res.json({ ok: true }); });
});

/**
 * @swagger
 * /auth/token-login:
 *   post:
 *     summary: JWT Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT tokens
 */
// JWT login (issue access + refresh)
router.post('/token-login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'No user' });
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) return res.status(400).json({ error: 'Invalid' });
  const access = signAccess({ sub: user.id });
  const refresh = signRefresh({ sub: user.id });
  user.refreshTokens.push({ token: refresh });
  await user.save();
  res.json({ access, refresh });
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: New access token
 *       401:
 *         description: Invalid token
 */
// Refresh endpoint
router.post('/refresh', async (req, res) => {
  const { refresh } = req.body;
  try {
    const data = verifyRefresh(refresh);
    const user = await User.findById(data.sub);
    if (!user) return res.status(401).json({ error: 'No user' });
    const found = user.refreshTokens.find(r => r.token === refresh);
    if (!found) return res.status(401).json({ error: 'Invalid refresh' });
    const access = signAccess({ sub: user.id });
    res.json({ access });
  } catch (err) { res.status(401).json({ error: 'Invalid token' }); }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and revoke refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh:
 *                 type: string
 *                 description: Refresh token to revoke
 *     responses:
 *       200:
 *         description: Logout success
 */
// Logout (revoke refresh tokens)
router.post('/logout', async (req, res) => {
  const { refresh } = req.body;
  if (refresh) {
    try {
      const data = verifyRefresh(refresh);
      const user = await User.findById(data.sub);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(r => r.token !== refresh);
        await user.save();
      }
    } catch (e) { }
  }
  req.logout(() => { });
  res.json({ ok: true });
});

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google login redirect
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirect to Google
 *
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirect after login
 */
// OAuth - Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: GitHub login redirect
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirect to GitHub
 *
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirect after login
 */
// OAuth - GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});

/**
 * @swagger
 * /auth/magic/request:
 *   post:
 *     summary: Request a magic link for passwordless login
 *     tags: [Magic Link]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Magic link sent
 *
 * /auth/magic/verify:
 *   get:
 *     summary: Verify magic link
 *     tags: [Magic Link]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Logged in via magic link
 *       400:
 *         description: Invalid or expired link
 */
// Magic link - request
router.post('/magic/request', async (req, res) => {
  const { email } = req.body;
  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email });
  const token = uuidv4();
  user.magicLinkToken = { token, expiresAt: new Date(Date.now() + 15 * 60 * 1000) };
  await user.save();
  const link = `${process.env.BASE_URL}/auth/magic/verify?token=${token}&email=${encodeURIComponent(email)}`;
  await sendEmail(email, 'Your magic link', `Click: ${link}`);
  res.json({ ok: true });
});

// Magic link - verify
router.get('/magic/verify', async (req, res) => {
  const { token, email } = req.query;
  const user = await User.findOne({ email });
  if (!user || !user.magicLinkToken) return res.status(400).send('Invalid');
  if (user.magicLinkToken.token !== token) return res.status(400).send('Invalid');
  if (new Date() > user.magicLinkToken.expiresAt) return res.status(400).send('Expired');
  user.magicLinkToken = null;
  await user.save();
  req.login(user, err => { if (err) return res.status(500).send('err'); res.send('Logged in via magic link'); });
});

/**
 * @swagger
 * /auth/totp/setup:
 *   post:
 *     summary: Setup TOTP for 2FA (returns QR + secret)
 *     tags: [TOTP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: QR code + secret returned
 *       401:
 *         description: Not authenticated
 *
 * /auth/totp/enable:
 *   post:
 *     summary: Enable TOTP after verifying code
 *     tags: [TOTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: TOTP enabled
 *       400:
 *         description: Invalid token
 *
 * /auth/totp/verify:
 *   post:
 *     summary: Verify a TOTP code
 *     tags: [TOTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: Verification result
 *       401:
 *         description: Not authenticated
 */
// TOTP setup
router.post('/totp/setup', async (req, res) => {
  // user must be authenticated (session) - simple check
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'login first' });
  const secret = speakeasy.generateSecret({ length: 20, name: `NodeAuth:${user.email}` });
  user.totpSecret = secret.base32;
  await user.save();
  const otpauth = secret.otpauth_url;
  const qr = await qrcode.toDataURL(otpauth);
  res.json({ qr, secret: secret.base32 });
});

router.post('/totp/enable', async (req, res) => {
  const user = req.user; if (!user) return res.status(401).json({ error: 'login first' });
  const { token } = req.body;
  const verified = speakeasy.totp.verify({ secret: user.totpSecret, encoding: 'base32', token, window: 1 });
  if (!verified) return res.status(400).json({ error: 'Invalid token' });
  user.isTotpEnabled = true; await user.save(); res.json({ ok: true });
});

router.post('/totp/verify', async (req, res) => {
  const { token } = req.body; const user = req.user; if (!user) return res.status(401).json({ error: 'login first' });
  const verified = speakeasy.totp.verify({ secret: user.totpSecret, encoding: 'base32', token, window: 1 });
  res.json({ verified });
});

module.exports = router;