const Asset = require('../models/Asset');
const AppError = require('../errors/AppError');
const { generateAssetCode } = require('../utils/codeGenerator');
const { buildPublicAssetUrl } = require('./qrService');
const historyService = require('./historyService');
const { HISTORY_ACTION } = require('../constants/history');
const { ASSET_STATUS, ASSET_STATUS_TRANSITIONS } = require('../constants/assetStatus');

const MAX_CODE_ATTEMPTS = 5;

async function createAsset(payload, actor) {
  let lastErr;
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const assetCode = generateAssetCode();
    try {
      const asset = await Asset.create({
        ...payload,
        assetCode,
        qrPublicUrl: buildPublicAssetUrl(assetCode),
        createdBy: actor._id,
      });

      await historyService.record({
        asset: asset._id,
        actor,
        action: HISTORY_ACTION.ASSET_CREATED,
        message: `Asset "${asset.name}" registered with code ${asset.assetCode}`,
      });

      return asset;
    } catch (err) {
      if (err.code === 11000 && err.keyValue && err.keyValue.assetCode) {
        lastErr = err;
        continue; // extremely unlikely collision - retry with a new code
      }
      throw err;
    }
  }
  throw lastErr || AppError.conflict('Could not generate a unique asset code, please retry');
}

async function listAssets({ page = 1, limit = 20, search, status, category, location, technician }) {
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (location) filter.location = new RegExp(location, 'i');
  if (technician) filter.assignedTechnician = technician;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Asset.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTechnician', 'name email'),
    Asset.countDocuments(filter),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

async function getAssetById(id) {
  const asset = await Asset.findById(id).populate('assignedTechnician', 'name email phone');
  if (!asset) throw AppError.notFound('Asset not found', 'ASSET_NOT_FOUND');
  return asset;
}

// Public, no-auth lookup - relies on Asset.PUBLIC_PROJECTION so private
// fields structurally can never leak here, and an invalid code 404s cleanly.
async function getPublicAssetByCode(assetCode) {
  const asset = await Asset.findOne({ assetCode }).select(Asset.PUBLIC_PROJECTION);
  if (!asset) throw AppError.notFound('Asset not found', 'ASSET_NOT_FOUND');
  return asset;
}

async function updateAsset(id, updates, actor) {
  const asset = await Asset.findById(id);
  if (!asset) throw AppError.notFound('Asset not found', 'ASSET_NOT_FOUND');

  if (updates.status && updates.status !== asset.status) {
    const allowed = ASSET_STATUS_TRANSITIONS[asset.status] || [];
    if (!allowed.includes(updates.status)) {
      throw AppError.badRequest(
        `Cannot move asset from "${asset.status}" to "${updates.status}"`,
        'INVALID_ASSET_STATUS_TRANSITION',
      );
    }
  }

  // assetCode is immutable - never allow it through even if sent.
  const { assetCode, ...safeUpdates } = updates;
  Object.assign(asset, safeUpdates);
  await asset.save();

  await historyService.record({
    asset: asset._id,
    actor,
    action: HISTORY_ACTION.ASSET_UPDATED,
    message: `Asset "${asset.name}" details updated`,
    meta: { updatedFields: Object.keys(safeUpdates) },
  });

  return asset;
}

async function retireAsset(id, actor) {
  const asset = await Asset.findById(id);
  if (!asset) throw AppError.notFound('Asset not found', 'ASSET_NOT_FOUND');

  asset.status = ASSET_STATUS.RETIRED;
  await asset.save();

  await historyService.record({
    asset: asset._id,
    actor,
    action: HISTORY_ACTION.ASSET_RETIRED,
    message: `Asset "${asset.name}" retired`,
  });

  return asset;
}

module.exports = {
  createAsset,
  listAssets,
  getAssetById,
  getPublicAssetByCode,
  updateAsset,
  retireAsset,
};
