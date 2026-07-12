const MaintenanceRecord = require('../models/MaintenanceRecord');
const Issue = require('../models/Issue');
const AppError = require('../errors/AppError');
const historyService = require('./historyService');
const { HISTORY_ACTION } = require('../constants/history');
const issueService = require('./issueService');

async function createMaintenanceRecord(issueId, payload, evidence, actor) {
  const issue = await Issue.findById(issueId).populate('asset');
  if (!issue) throw AppError.notFound('Issue not found', 'ISSUE_NOT_FOUND');

  issueService.assertNotClosed(issue);
  issueService.assertTechnicianOwnsIssue(issue, actor);

  const parts = payload.parts || [];
  const partsCost = parts.reduce((sum, p) => sum + (p.cost || 0) * (p.quantity || 1), 0);
  const totalCost = payload.totalCost !== undefined ? payload.totalCost : partsCost;

  if (totalCost < 0) {
    throw AppError.badRequest('Maintenance cost cannot be negative', 'NEGATIVE_COST');
  }

  const record = await MaintenanceRecord.create({
    issue: issue._id,
    asset: issue.asset._id,
    technician: actor._id,
    inspectionNotes: payload.inspectionNotes,
    technicianNotes: payload.technicianNotes,
    workPerformed: payload.workPerformed,
    parts,
    totalCost,
    timeSpentMinutes: payload.timeSpentMinutes,
    finalCondition: payload.finalCondition,
    evidence,
    completionDate: payload.completionDate,
    nextServiceDate: payload.nextServiceDate,
  });

  // Keep the asset's own service-date fields in sync for quick display,
  // without requiring a separate asset PATCH call from the frontend.
  if (payload.completionDate) issue.asset.lastServiceDate = payload.completionDate;
  if (payload.nextServiceDate) issue.asset.nextServiceDate = payload.nextServiceDate;
  if (payload.completionDate || payload.nextServiceDate) await issue.asset.save();

  await historyService.record({
    asset: issue.asset._id,
    issue: issue._id,
    actor,
    action: HISTORY_ACTION.MAINTENANCE_RECORDED,
    message: `Maintenance recorded for issue ${issue.issueNumber}${payload.workPerformed ? `: ${payload.workPerformed}` : ''}`,
  });

  return record;
}

async function listForIssue(issueId) {
  return MaintenanceRecord.find({ issue: issueId }).sort({ createdAt: -1 }).populate('technician', 'name');
}

async function listForAsset(assetId) {
  return MaintenanceRecord.find({ asset: assetId }).sort({ createdAt: -1 }).populate('technician', 'name');
}

module.exports = { createMaintenanceRecord, listForIssue, listForAsset };
