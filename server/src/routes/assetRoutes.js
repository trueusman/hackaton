const express = require('express');
const assetController = require('../controllers/assetController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const {
  createAssetValidator,
  updateAssetValidator,
  listAssetsValidator,
  assetIdParamValidator,
  assetCodeParamValidator,
} = require('../validators/assetValidators');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// Public, no-auth - must be registered before any /:id route to avoid
// "public" being captured as an :id param, and must never require protect().
router.get(
  '/public/:assetCode',
  assetCodeParamValidator,
  validate,
  assetController.getPublicAsset,
);

router.use(protect);

router.post(
  '/',
  authorize(ROLES.ADMIN),
  createAssetValidator,
  validate,
  assetController.createAsset,
);

router.get('/', listAssetsValidator, validate, assetController.listAssets);
router.get('/:id', assetIdParamValidator, validate, assetController.getAsset);
router.get('/:id/history', assetIdParamValidator, validate, assetController.getAssetHistory);
router.get('/:id/qr', assetIdParamValidator, validate, assetController.getAssetQr);
router.get('/:id/qr/download', assetIdParamValidator, validate, assetController.downloadAssetQr);

router.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  updateAssetValidator,
  validate,
  assetController.updateAsset,
);

router.post(
  '/:id/retire',
  authorize(ROLES.ADMIN),
  assetIdParamValidator,
  validate,
  assetController.retireAsset,
);

module.exports = router;
