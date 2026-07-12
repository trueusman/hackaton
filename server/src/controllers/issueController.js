const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const issueService = require('../services/issueService');
const cloudinaryService = require('../services/cloudinaryService');

// Public, no-auth: preview AI triage suggestion before the reporter submits.
const previewAiTriage = asyncHandler(async (req, res) => {
  const suggestion = await issueService.previewAiTriage(req.body);
  sendSuccess(res, { message: 'AI triage suggestion', data: { suggestion } });
});

// Public, no-auth (optionalAuth attaches req.user if the reporter happens to be logged in).
// Evidence files, if any, are uploaded to Cloudinary in the same request so
// the reporter doesn't need a separate round trip before submitting.
const createIssue = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const evidence = files.length ? await cloudinaryService.uploadMany(files, 'maintainiq/issues') : [];

  const aiSuggestion =
    typeof req.body.aiSuggestion === 'string' ? JSON.parse(req.body.aiSuggestion) : req.body.aiSuggestion;

  const issue = await issueService.createIssue(
    { ...req.body, aiSuggestion, evidence },
    req.user || null,
  );
  sendSuccess(res, { statusCode: 201, message: 'Issue reported', data: { issue } });
});

// Public, no-auth: reporter checks status with just their issue number.
const getPublicIssueStatus = asyncHandler(async (req, res) => {
  const issue = await issueService.getPublicStatusByIssueNumber(req.params.issueNumber);
  sendSuccess(res, { message: 'Issue status', data: { issue } });
});

const listIssues = asyncHandler(async (req, res) => {
  const { page, limit, status, priority, assetId, technician, search } = req.query;
  const { items, meta } = await issueService.listIssues({
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    status,
    priority,
    assetId,
    technician,
    search,
  });
  sendSuccess(res, { message: 'Issues', data: { issues: items }, meta });
});

const getIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.getIssueById(req.params.id);
  sendSuccess(res, { message: 'Issue', data: { issue } });
});

const assignIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.assignIssue(req.params.id, req.body.technicianId, req.user);
  sendSuccess(res, { message: 'Issue assigned', data: { issue } });
});

const updateStatus = asyncHandler(async (req, res) => {
  const issue = await issueService.updateStatus(req.params.id, req.body.status, req.user);
  sendSuccess(res, { message: 'Issue status updated', data: { issue } });
});

const resolveIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.resolveIssue(req.params.id, req.body.resolutionSummary, req.user);
  sendSuccess(res, { message: 'Issue resolved', data: { issue } });
});

const closeIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.closeIssue(req.params.id, req.user);
  sendSuccess(res, { message: 'Issue closed', data: { issue } });
});

const reopenIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.reopenIssue(req.params.id, req.body.reason, req.user);
  sendSuccess(res, { message: 'Issue reopened', data: { issue } });
});

module.exports = {
  previewAiTriage,
  createIssue,
  getPublicIssueStatus,
  listIssues,
  getIssue,
  assignIssue,
  updateStatus,
  resolveIssue,
  closeIssue,
  reopenIssue,
};
