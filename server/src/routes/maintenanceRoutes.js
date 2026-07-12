const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const upload = require('../middlewares/upload');
const { uploadLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { createMaintenanceValidator } = require('../validators/maintenanceValidators');
const { ROLES } = require('../constants/roles');
const { param } = require('express-validator');

const router = express.Router();

router.use(protect);

router.post(
  '/issues/:issueId',
  authorize(ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.TECHNICIAN),
  uploadLimiter,
  upload.array('evidence', 5),
  createMaintenanceValidator,
  validate,
  maintenanceController.createMaintenanceRecord,
);

router.get('/issues/:issueId', [param('issueId').isMongoId()], validate, maintenanceController.listForIssue);
router.get('/assets/:assetId', [param('assetId').isMongoId()], validate, maintenanceController.listForAsset);

module.exports = router;
