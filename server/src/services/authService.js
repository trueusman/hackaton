const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../errors/AppError');
const { ROLES } = require('../constants/roles');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/tokens');

const SALT_ROUNDS = 12;

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
}

// Public self-registration - role is always forced to reporter regardless of
// request body, so nobody can hand themselves admin/technician via this route.
async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw AppError.conflict('An account with this email already exists', 'EMAIL_IN_USE');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, role: ROLES.REPORTER });

  const tokens = await issueTokenPair(user);
  return { user: user.toSafeJSON(), ...tokens };
}

// Admin-only: create staff accounts with an explicit role.
async function adminCreateUser({ name, email, password, role, phone }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw AppError.conflict('An account with this email already exists', 'EMAIL_IN_USE');
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, role, phone });
  return user.toSafeJSON();
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) {
    throw AppError.forbidden('This account has been deactivated', 'USER_INACTIVE');
  }

  const tokens = await issueTokenPair(user);
  return { user: user.toSafeJSON(), ...tokens };
}

// Rotates the refresh token: verifies signature, matches the hash stored on
// the user, then issues a fresh pair and invalidates the old refresh token.
async function refresh(refreshToken) {
  if (!refreshToken) {
    throw AppError.unauthorized('Refresh token missing', 'REFRESH_TOKEN_MISSING');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token', 'REFRESH_TOKEN_INVALID');
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user || !user.isActive || user.refreshTokenHash !== hashToken(refreshToken)) {
    throw AppError.unauthorized('Refresh token has been revoked', 'REFRESH_TOKEN_REVOKED');
  }

  const tokens = await issueTokenPair(user);
  return { user: user.toSafeJSON(), ...tokens };
}

async function logout(userId) {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
}

module.exports = { register, adminCreateUser, login, refresh, logout };
