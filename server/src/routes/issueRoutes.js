const express = require('express');
const issueController = require('../controllers/issueController');
const { protect, optionalAuth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const upload = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { publicReportLimiter, aiLimiter } = require('../middlewares/rateLimiter');
const {
  createIssueValidator,
  assignIssueValidator,
  updateStatusValidator,
  resolveIssueValidator,
  aiTriageValidator,
  listIssuesValidator,
  issueIdParamValidator,
} = require('../validators/issueValidators');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// Public, no-auth - the reporting workflow from the QR public asset page.
router.post(
  '/ai-triage',
  aiLimiter,
  aiTriageValidator,
  validate,
  issueController.previewAiTriage,
);

router.post(
  '/',
  publicReportLimiter,
  optionalAuth,
  upload.array('evidence', 5),
  createIssueValidator,
  validate,
  issueController.createIssue,
);

router.get('/public/:issueNumber', issueController.getPublicIssueStatus);

router.use(protect);

router.get('/', listIssuesValidator, validate, issueController.listIssues);
router.get('/:id', issueIdParamValidator, validate, issueController.getIssue);

router.patch(
  '/:id/assign',
  authorize(ROLES.ADMIN, ROLES.SUPERVISOR),
  assignIssueValidator,
  validate,
  issueController.assignIssue,
);

router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.TECHNICIAN),
  updateStatusValidator,
  validate,
  issueController.updateStatus,
);

router.patch(
  '/:id/resolve',
  authorize(ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.TECHNICIAN),
  resolveIssueValidator,
  validate,
  issueController.resolveIssue,
);

router.patch(
  '/:id/close',
  authorize(ROLES.ADMIN, ROLES.SUPERVISOR),
  issueIdParamValidator,
  validate,
  issueController.closeIssue,
);

router.patch(
  '/:id/reopen',
  authorize(ROLES.ADMIN, ROLES.SUPERVISOR),
  issueIdParamValidator,
  validate,
  issueController.reopenIssue,
);

module.exports = router;
