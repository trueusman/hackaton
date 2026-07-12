const { body } = require('express-validator');
const { ALL_ROLES } = require('../constants/roles');

// Admin-only: create a staff account (technician/supervisor/admin/reporter).
const adminCreateUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(ALL_ROLES).withMessage('Invalid role'),
];

module.exports = { adminCreateUserValidator };
