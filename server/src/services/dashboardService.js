const Asset = require('../models/Asset');
const Issue = require('../models/Issue');
const { ASSET_STATUS } = require('../constants/assetStatus');
const { ISSUE_STATUS, PRIORITY } = require('../constants/issueStatus');

// Useful operational summaries, not decorative charts - counts that answer
// "what needs attention right now" per the brief's dashboard guidance.
async function getSummary(actor) {
  const technicianFilter = actor.role === 'technician' ? { assignedTechnician: actor._id } : {};

  const [
    totalAssets,
    assetsByStatus,
    openIssues,
    criticalOpenIssues,
    unassignedIssues,
    issuesByStatus,
    myOpenIssues,
  ] = await Promise.all([
    Asset.countDocuments(),
    Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Issue.countDocuments({ status: { $nin: [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED] } }),
    Issue.countDocuments({
      priority: PRIORITY.CRITICAL,
      status: { $nin: [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED] },
    }),
    Issue.countDocuments({ status: ISSUE_STATUS.REPORTED, assignedTechnician: null }),
    Issue.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Issue.countDocuments({
      ...technicianFilter,
      status: { $nin: [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED] },
    }),
  ]);

  const statusMap = (arr) => Object.fromEntries(arr.map((x) => [x._id, x.count]));

  return {
    totalAssets,
    assetsByStatus: statusMap(assetsByStatus),
    outOfServiceAssets: statusMap(assetsByStatus)[ASSET_STATUS.OUT_OF_SERVICE] || 0,
    openIssues,
    criticalOpenIssues,
    unassignedIssues,
    issuesByStatus: statusMap(issuesByStatus),
    myOpenIssues,
  };
}

module.exports = { getSummary };
