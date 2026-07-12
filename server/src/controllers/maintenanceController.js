const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const maintenanceService = require('../services/maintenanceService');
const cloudinaryService = require('../services/cloudinaryService');

const createMaintenanceRecord = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const evidence = files.length ? await cloudinaryService.uploadMany(files, 'maintainiq/maintenance') : [];

  const parts = typeof req.body.parts === 'string' ? JSON.parse(req.body.parts) : req.body.parts;

  const record = await maintenanceService.createMaintenanceRecord(
    req.params.issueId,
    { ...req.body, parts },
    evidence,
    req.user,
  );
  sendSuccess(res, { statusCode: 201, message: 'Maintenance record created', data: { record } });
});

const listForIssue = asyncHandler(async (req, res) => {
  const records = await maintenanceService.listForIssue(req.params.issueId);
  sendSuccess(res, { message: 'Maintenance records', data: { records } });
});

const listForAsset = asyncHandler(async (req, res) => {
  const records = await maintenanceService.listForAsset(req.params.assetId);
  sendSuccess(res, { message: 'Maintenance records', data: { records } });
});

module.exports = { createMaintenanceRecord, listForIssue, listForAsset };
