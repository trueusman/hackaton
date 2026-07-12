const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const assetService = require('../services/assetService');
const historyService = require('../services/historyService');
const qrService = require('../services/qrService');

const createAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.createAsset(req.body, req.user);
  sendSuccess(res, { statusCode: 201, message: 'Asset registered', data: { asset } });
});

const listAssets = asyncHandler(async (req, res) => {
  const { page, limit, search, status, category, location, technician } = req.query;
  const { items, meta } = await assetService.listAssets({
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    search,
    status,
    category,
    location,
    technician,
  });
  sendSuccess(res, { message: 'Assets', data: { assets: items }, meta });
});

const getAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.getAssetById(req.params.id);
  sendSuccess(res, { message: 'Asset', data: { asset } });
});

const updateAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.updateAsset(req.params.id, req.body, req.user);
  sendSuccess(res, { message: 'Asset updated', data: { asset } });
});

const retireAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.retireAsset(req.params.id, req.user);
  sendSuccess(res, { message: 'Asset retired', data: { asset } });
});

const getAssetHistory = asyncHandler(async (req, res) => {
  const history = await historyService.listForAsset(req.params.id);
  sendSuccess(res, { message: 'Asset history', data: { history } });
});

const getAssetQr = asyncHandler(async (req, res) => {
  const asset = await assetService.getAssetById(req.params.id);
  const { url, dataUrl } = await qrService.generateQrDataUrl(asset.assetCode);
  sendSuccess(res, { message: 'QR code', data: { publicUrl: url, qrDataUrl: dataUrl } });
});

const downloadAssetQr = asyncHandler(async (req, res) => {
  const asset = await assetService.getAssetById(req.params.id);
  const { buffer } = await qrService.generateQrBuffer(asset.assetCode);
  res.set('Content-Type', 'image/png');
  res.set('Content-Disposition', `attachment; filename="${asset.assetCode}-qr.png"`);
  res.send(buffer);
});

// Public, no-auth: resolves by assetCode and returns only the safe projection.
const getPublicAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.getPublicAssetByCode(req.params.assetCode);
  const safeHistory = await historyService.listSafeForAsset(asset._id, { limit: 10 });
  const url = qrService.buildPublicAssetUrl(asset.assetCode);
  sendSuccess(res, { message: 'Public asset', data: { asset, recentActivity: safeHistory, publicUrl: url } });
});

module.exports = {
  createAsset,
  listAssets,
  getAsset,
  updateAsset,
  retireAsset,
  getAssetHistory,
  getAssetQr,
  downloadAssetQr,
  getPublicAsset,
};
