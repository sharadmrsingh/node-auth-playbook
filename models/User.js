const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  name: { type: String },
  googleId: { type: String },
  githubId: { type: String },
  totpSecret: { type: String },
  isTotpEnabled: { type: Boolean, default: false },
  refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],
  magicLinkToken: { token: String, expiresAt: Date }
});

module.exports = mongoose.model('User', UserSchema);