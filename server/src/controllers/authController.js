const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const authService = require('../services/authService');
const env = require('../config/env');

const REFRESH_COOKIE_NAME = 'maintainiq_refresh';

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: env.JWT_REFRESH_EXPIRES_MS,
    path: '/api/auth',
  });
}

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { statusCode: 201, message: 'Account created', data: { user, accessToken } });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { message: 'Login successful', data: { user, accessToken } });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE_NAME];
  const { user, accessToken, refreshToken } = await authService.refresh(token);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { message: 'Token refreshed', data: { user, accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  if (req.user) await authService.logout(req.user._id);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  sendSuccess(res, { message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Current user', data: { user: req.user.toSafeJSON() } });
});

module.exports = { register, login, refresh, logout, me };
