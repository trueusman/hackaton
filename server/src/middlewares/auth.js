const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../errors/AppError');
const { verifyAccessToken } = require('../utils/tokens');
const User = require('../models/User');

// Verifies the JWT AND re-loads the user from the DB on every request, so a
// demoted/deactivated user's still-valid access token stops working within
// its own 15-minute lifetime instead of being trusted blindly.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw AppError.unauthorized('Authentication token missing');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw AppError.unauthorized('Invalid or expired token', 'TOKEN_INVALID');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw AppError.unauthorized('User no longer active', 'USER_INACTIVE');
  }

  req.user = user;
  next();
});

// Best-effort auth: attaches req.user if a valid token is present, but never
// blocks the request. Used on routes that behave differently for logged-in
// reporters vs anonymous public users without requiring login.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (user && user.isActive) req.user = user;
  } catch {
    // ignore invalid token on optional routes
  }
  next();
});

module.exports = { protect, optionalAuth };
