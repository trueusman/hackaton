const rateLimit = require('express-rate-limit');

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.', code: 'RATE_LIMITED' },
};

// Public issue-reporting endpoint - highest abuse risk since it needs no auth.
const publicReportLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 20,
});

// Auth endpoints - slow down credential stuffing / brute force.
const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 30,
});

// AI triage endpoint - protects the Gemini quota/cost.
const aiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 5 * 60 * 1000,
  limit: 20,
});

// Evidence upload endpoints - Cloudinary quota protection.
const uploadLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 40,
});

module.exports = { publicReportLimiter, authLimiter, aiLimiter, uploadLimiter };
