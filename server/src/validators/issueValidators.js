const { body, param, query } = require('express-validator');
const { ALL_ISSUE_STATUSES, ALL_PRIORITIES } = require('../constants/issueStatus');

const createIssueValidator = [
  body('assetCode').trim().notEmpty().withMessage('assetCode is required'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 3000 }),
  body('category').optional().trim(),
  body('priority').optional().isIn(ALL_PRIORITIES),
  body('reporterName').optional().trim(),
  body('reporterContact').optional().trim(),
];

const assignIssueValidator = [
  param('id').isMongoId(),
  body('technicianId').isMongoId().withMessage('Valid technicianId is required'),
];

const updateStatusValidator = [
  param('id').isMongoId(),
  body('status').isIn(ALL_ISSUE_STATUSES).withMessage('Invalid status'),
];

const resolveIssueValidator = [
  param('id').isMongoId(),
  body('resolutionSummary').trim().notEmpty().withMessage('Resolution summary is required'),
];

const aiTriageValidator = [
  body('assetCode').trim().notEmpty().withMessage('assetCode is required'),
  body('complaint').trim().notEmpty().withMessage('complaint text is required').isLength({ max: 2000 }),
];

const listIssuesValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(ALL_ISSUE_STATUSES),
  query('priority').optional().isIn(ALL_PRIORITIES),
];

const issueIdParamValidator = [param('id').isMongoId()];

module.exports = {
  createIssueValidator,
  assignIssueValidator,
  updateStatusValidator,
  resolveIssueValidator,
  aiTriageValidator,
  listIssuesValidator,
  issueIdParamValidator,
};
