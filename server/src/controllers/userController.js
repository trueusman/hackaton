const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const authService = require('../services/authService');
const User = require('../models/User');
const { ROLES } = require('../constants/roles');

const createUser = asyncHandler(async (req, res) => {
  const user = await authService.adminCreateUser(req.body);
  sendSuccess(res, { statusCode: 201, message: 'User created', data: { user } });
});

const listTechnicians = asyncHandler(async (req, res) => {
  const technicians = await User.find({ role: ROLES.TECHNICIAN, isActive: true }).select('name email phone');
  sendSuccess(res, { message: 'Technicians', data: { technicians } });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('name email role isActive createdAt').sort({ createdAt: -1 });
  sendSuccess(res, { message: 'Users', data: { users } });
});

module.exports = { createUser, listTechnicians, listUsers };
