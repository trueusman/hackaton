const { body, param } = require('express-validator');

const createMaintenanceValidator = [
  param('issueId').isMongoId(),
  body('inspectionNotes').optional().trim().isLength({ max: 3000 }),
  body('technicianNotes').optional().trim().isLength({ max: 3000 }),
  body('workPerformed').optional().trim().isLength({ max: 3000 }),
  body('parts').optional().isArray(),
  body('parts.*.name').optional().trim().notEmpty(),
  body('parts.*.quantity').optional().isInt({ min: 1 }),
  body('parts.*.cost').optional().isFloat({ min: 0 }).withMessage('Part cost cannot be negative'),
  body('totalCost').optional().isFloat({ min: 0 }).withMessage('Maintenance cost cannot be negative'),
  body('timeSpentMinutes').optional().isInt({ min: 0 }),
  body('finalCondition').optional().trim(),
  body('completionDate').optional().isISO8601(),
  body('nextServiceDate').optional().isISO8601(),
];

module.exports = { createMaintenanceValidator };
