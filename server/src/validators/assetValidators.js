const { body, param, query } = require('express-validator');
const { CONDITIONS } = require('../models/Asset');
const { ALL_ASSET_STATUSES } = require('../constants/assetStatus');

const createAssetValidator = [
  body('name').trim().notEmpty().withMessage('Asset name is required').isLength({ max: 200 }),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('condition').optional().isIn(CONDITIONS),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('model').optional().trim(),
  body('serialNumber').optional().trim(),
  body('assignedTechnician').optional().isMongoId(),
  body('nextServiceDate').optional().isISO8601(),
  body('purchaseCost').optional().isFloat({ min: 0 }).withMessage('Purchase cost cannot be negative'),
];

const updateAssetValidator = [
  param('id').isMongoId(),
  body('name').optional().trim().isLength({ max: 200 }),
  body('category').optional().trim(),
  body('location').optional().trim(),
  body('condition').optional().isIn(CONDITIONS),
  body('status').optional().isIn(ALL_ASSET_STATUSES),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('assignedTechnician').optional().isMongoId(),
  body('lastServiceDate').optional().isISO8601(),
  body('nextServiceDate').optional().isISO8601(),
  body('purchaseCost').optional().isFloat({ min: 0 }).withMessage('Purchase cost cannot be negative'),
];

const listAssetsValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(ALL_ASSET_STATUSES),
];

const assetIdParamValidator = [param('id').isMongoId()];
const assetCodeParamValidator = [param('assetCode').trim().notEmpty()];

module.exports = {
  createAssetValidator,
  updateAssetValidator,
  listAssetsValidator,
  assetIdParamValidator,
  assetCodeParamValidator,
};
