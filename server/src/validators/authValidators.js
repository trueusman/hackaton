const { body } = require('express-validator');

// Public self-registration never accepts a role - it is always forced to
// "reporter" in authService.register. Admin/technician/supervisor accounts
// can only be created by an admin via userValidators.adminCreateUserValidator.
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };
