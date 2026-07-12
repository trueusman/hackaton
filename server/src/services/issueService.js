const Issue = require('../models/Issue');
const Asset = require('../models/Asset');
const MaintenanceRecord = require('../models/MaintenanceRecord');
const User = require('../models/User');
const AppError = require('../errors/AppError');
const { generateIssueNumber } = require('../utils/codeGenerator');
const historyService = require('./historyService');
const aiService = require('./aiService');
const { HISTORY_ACTION } = require('../constants/history');
const { ASSET_STATUS } = require('../constants/assetStatus');
const {
  ISSUE_STATUS,
  ISSUE_STATUS_TRANSITIONS,
  ISSUE_TO_ASSET_STATUS,
} = require('../constants/issueStatus');
const { ROLES } = require('../constants/roles');

const MAX_NUMBER_ATTEMPTS = 5;

function assertNotClosed(issue) {
  if (issue.status === ISSUE_STATUS.CLOSED) {
    throw AppError.forbidden('Closed issues cannot be edited until reopened', 'ISSUE_CLOSED');
  }
}

function assertTechnicianOwnsIssue(issue, actor) {
  if (actor.role === ROLES.TECHNICIAN) {
    const owns = issue.assignedTechnician && issue.assignedTechnician.toString() === actor._id.toString();
    if (!owns) {
      throw AppError.forbidden('You may only update issues assigned to you', 'NOT_YOUR_ISSUE');
    }
  }
}

async function syncAssetStatusForIssue(asset, issueStatus) {
  if (asset.status === ASSET_STATUS.RETIRED) return; // retired assets never get pulled back by issue workflow
  const mapped = ISSUE_TO_ASSET_STATUS[issueStatus];
  if (mapped && asset.status !== mapped) {
    asset.status = mapped;
    await asset.save();
  }
}

// AI preview only - called from the public report form BEFORE the issue is
// created. Never persists anything; the caller decides what to keep.
async function previewAiTriage({ assetCode, complaint }) {
  const asset = await Asset.findOne({ assetCode });
  if (!asset) throw AppError.notFound('Asset not found', 'ASSET_NOT_FOUND');

  const recentHistory = await historyService.listSafeForAsset(asset._id, { limit: 5 });
  const suggestion = await aiService.triageIssue({ asset, complaint, recentHistory });
  return suggestion;
}

// aiSuggestion (optional) is the raw object returned by previewAiTriage. We
// diff the final submitted values against it to record AI-suggested vs.
// user-edited provenance per field, per the brief's AI quality requirements.
function buildAiTriageProvenance(finalValues, aiSuggestion) {
  if (!aiSuggestion) return undefined;
  const field = (key) => ({
    value: finalValues[key],
    aiSuggested: true,
    userEdited: finalValues[key] !== aiSuggestion[key],
  });
  return {
    title: field('title'),
    category: field('category'),
    priority: field('priority'),
    possibleCauses: { value: aiSuggestion.possibleCauses, aiSuggested: true, userEdited: false },
    initialChecks: { value: aiSuggestion.initialChecks, aiSuggested: true, userEdited: false },
    recurringPatternWarning: {
      value: aiSuggestion.recurringPatternWarning,
      aiSuggested: true,
      userEdited: false,
    },
    raw: aiSuggestion,
    triagedAt: new Date(),
  };
}

async function createIssue(payload, reporterUser) {
  const { assetCode, title, description, category, priority, reporterName, reporterContact, aiSuggestion, evidence } = payload;

  const asset = await Asset.findOne({ assetCode });
  if (!asset) throw AppError.notFound('Asset not found', 'ASSET_NOT_FOUND');
  if (asset.status === ASSET_STATUS.RETIRED) {
    throw AppError.badRequest('This asset is retired and cannot accept new issues', 'ASSET_RETIRED');
  }

  let lastErr;
  for (let attempt = 0; attempt < MAX_NUMBER_ATTEMPTS; attempt += 1) {
    const issueNumber = generateIssueNumber();
    try {
      const issue = await Issue.create({
        issueNumber,
        asset: asset._id,
        title,
        description,
        category,
        priority,
        reporterName,
        reporterContact,
        reportedBy: reporterUser ? reporterUser._id : null,
        evidence: evidence || [],
        aiTriage: buildAiTriageProvenance({ title, category, priority }, aiSuggestion),
      });

      await syncAssetStatusForIssue(asset, ISSUE_STATUS.REPORTED);

      await historyService.record({
        asset: asset._id,
        issue: issue._id,
        actor: reporterUser,
        action: HISTORY_ACTION.ISSUE_REPORTED,
        message: `Issue ${issue.issueNumber} reported: "${issue.title}"`,
      });

      return issue;
    } catch (err) {
      if (err.code === 11000 && err.keyValue && err.keyValue.issueNumber) {
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  throw lastErr || AppError.conflict('Could not generate a unique issue number, please retry');
}

// Public, no-auth: lets a reporter check status with just their issue number.
// Deliberately excludes evidence, notes, technician identity, and cost.
async function getPublicStatusByIssueNumber(issueNumber) {
  const issue = await Issue.findOne({ issueNumber }).select(
    'issueNumber title status priority category createdAt resolvedAt closedAt',
  );
  if (!issue) throw AppError.notFound('No issue found with that number', 'ISSUE_NOT_FOUND');
  return issue;
}

async function listIssues({ page = 1, limit = 20, status, priority, assetId, technician, search }) {
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assetId) filter.asset = assetId;
  if (technician) filter.assignedTechnician = technician;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('asset', 'assetCode name location category status')
      .populate('assignedTechnician', 'name email'),
    Issue.countDocuments(filter),
  ]);

  return { items, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

async function getIssueById(id) {
  const issue = await Issue.findById(id)
    .populate('asset')
    .populate('assignedTechnician', 'name email phone')
    .populate('reportedBy', 'name email');
  if (!issue) throw AppError.notFound('Issue not found', 'ISSUE_NOT_FOUND');
  return issue;
}

async function assignIssue(issueId, technicianId, actor) {
  const issue = await Issue.findById(issueId).populate('asset');
  if (!issue) throw AppError.notFound('Issue not found', 'ISSUE_NOT_FOUND');
  assertNotClosed(issue);

  const technician = await User.findById(technicianId);
  if (!technician || technician.role !== ROLES.TECHNICIAN) {
    throw AppError.badRequest('technicianId must reference an active technician', 'INVALID_TECHNICIAN');
  }

  const isFreshAssignment = [ISSUE_STATUS.REPORTED, ISSUE_STATUS.REOPENED].includes(issue.status);
  if (isFreshAssignment) {
    const allowed = ISSUE_STATUS_TRANSITIONS[issue.status] || [];
    if (!allowed.includes(ISSUE_STATUS.ASSIGNED)) {
      throw AppError.badRequest(`Cannot assign an issue from status "${issue.status}"`, 'INVALID_ISSUE_STATUS_TRANSITION');
    }
    issue.status = ISSUE_STATUS.ASSIGNED;
  }

  issue.assignedTechnician = technician._id;
  await issue.save();

  await historyService.record({
    asset: issue.asset._id,
    issue: issue._id,
    actor,
    action: HISTORY_ACTION.ISSUE_ASSIGNED,
    message: `Issue ${issue.issueNumber} assigned to ${technician.name}`,
  });

  return issue;
}

// Generic workflow-status endpoint. RESOLVED is intentionally excluded here
// and only reachable via resolveIssue(), which enforces the "no resolution
// without a maintenance note" business rule.
async function updateStatus(issueId, newStatus, actor) {
  if (newStatus === ISSUE_STATUS.RESOLVED) {
    throw AppError.badRequest('Use the resolve endpoint to resolve an issue', 'USE_RESOLVE_ENDPOINT');
  }

  const issue = await Issue.findById(issueId).populate('asset');
  if (!issue) throw AppError.notFound('Issue not found', 'ISSUE_NOT_FOUND');
  assertNotClosed(issue);
  assertTechnicianOwnsIssue(issue, actor);

  const allowed = ISSUE_STATUS_TRANSITIONS[issue.status] || [];
  if (!allowed.includes(newStatus)) {
    throw AppError.badRequest(
      `Cannot move issue from "${issue.status}" to "${newStatus}"`,
      'INVALID_ISSUE_STATUS_TRANSITION',
    );
  }

  const previousStatus = issue.status;
  issue.status = newStatus;
  await issue.save();
  await syncAssetStatusForIssue(issue.asset, newStatus);

  await historyService.record({
    asset: issue.asset._id,
    issue: issue._id,
    actor,
    action: HISTORY_ACTION.ISSUE_STATUS_CHANGED,
    message: `Issue ${issue.issueNumber} moved from "${previousStatus}" to "${newStatus}"`,
  });

  return issue;
}

async function resolveIssue(issueId, resolutionSummary, actor) {
  const issue = await Issue.findById(issueId).populate('asset');
  if (!issue) throw AppError.notFound('Issue not found', 'ISSUE_NOT_FOUND');
  assertNotClosed(issue);
  assertTechnicianOwnsIssue(issue, actor);

  const allowed = ISSUE_STATUS_TRANSITIONS[issue.status] || [];
  if (!allowed.includes(ISSUE_STATUS.RESOLVED)) {
    throw AppError.badRequest(`Cannot resolve an issue from status "${issue.status}"`, 'INVALID_ISSUE_STATUS_TRANSITION');
  }

  const hasMaintenanceNote = await MaintenanceRecord.exists({ issue: issue._id });
  if (!hasMaintenanceNote) {
    throw AppError.badRequest(
      'An issue cannot be resolved without at least one maintenance record',
      'MAINTENANCE_NOTE_REQUIRED',
    );
  }

  issue.status = ISSUE_STATUS.RESOLVED;
  issue.resolutionSummary = resolutionSummary;
  issue.resolvedAt = new Date();
  await issue.save();
  await syncAssetStatusForIssue(issue.asset, ISSUE_STATUS.RESOLVED);

  await historyService.record({
    asset: issue.asset._id,
    issue: issue._id,
    actor,
    action: HISTORY_ACTION.ISSUE_RESOLVED,
    message: `Issue ${issue.issueNumber} resolved`,
  });

  return issue;
}

async function closeIssue(issueId, actor) {
  const issue = await Issue.findById(issueId).populate('asset');
  if (!issue) throw AppError.notFound('Issue not found', 'ISSUE_NOT_FOUND');

  const allowed = ISSUE_STATUS_TRANSITIONS[issue.status] || [];
  if (!allowed.includes(ISSUE_STATUS.CLOSED)) {
    throw AppError.badRequest(`Cannot close an issue from status "${issue.status}"`, 'INVALID_ISSUE_STATUS_TRANSITION');
  }

  issue.status = ISSUE_STATUS.CLOSED;
  issue.closedAt = new Date();
  await issue.save();

  await historyService.record({
    asset: issue.asset._id,
    issue: issue._id,
    actor,
    action: HISTORY_ACTION.ISSUE_CLOSED,
    message: `Issue ${issue.issueNumber} closed`,
  });

  return issue;
}

async function reopenIssue(issueId, reason, actor) {
  const issue = await Issue.findById(issueId).populate('asset');
  if (!issue) throw AppError.notFound('Issue not found', 'ISSUE_NOT_FOUND');

  const allowed = ISSUE_STATUS_TRANSITIONS[issue.status] || [];
  if (!allowed.includes(ISSUE_STATUS.REOPENED)) {
    throw AppError.badRequest(`Cannot reopen an issue from status "${issue.status}"`, 'INVALID_ISSUE_STATUS_TRANSITION');
  }

  issue.status = ISSUE_STATUS.REOPENED;
  issue.resolvedAt = null;
  issue.closedAt = null;
  await issue.save();
  await syncAssetStatusForIssue(issue.asset, ISSUE_STATUS.REOPENED);

  await historyService.record({
    asset: issue.asset._id,
    issue: issue._id,
    actor,
    action: HISTORY_ACTION.ISSUE_REOPENED,
    message: `Issue ${issue.issueNumber} reopened${reason ? `: ${reason}` : ''}`,
  });

  return issue;
}

module.exports = {
  previewAiTriage,
  createIssue,
  getPublicStatusByIssueNumber,
  listIssues,
  getIssueById,
  assignIssue,
  updateStatus,
  resolveIssue,
  closeIssue,
  reopenIssue,
  assertNotClosed,
  assertTechnicianOwnsIssue,
};
