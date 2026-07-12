const History = require('../models/History');

// The only writer of History documents in the whole codebase. No route ever
// updates or deletes a History entry - see server/src/models/History.js.
async function record({ asset, issue = null, actor = null, action, message, meta = null }) {
  return History.create({
    asset,
    issue,
    actor: actor ? actor._id : null,
    actorName: actor ? actor.name : 'System',
    action,
    message,
    meta,
  });
}

async function listForAsset(assetId, { limit = 50 } = {}) {
  return History.find({ asset: assetId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor', 'name role')
    .populate('issue', 'issueNumber title');
}

// Safe subset shown on the public asset page - action + message + date only,
// no actor identity or internal meta.
async function listSafeForAsset(assetId, { limit = 10 } = {}) {
  const entries = await History.find({ asset: assetId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('action message createdAt');
  return entries.map((e) => ({ action: e.action, message: e.message, createdAt: e.createdAt }));
}

module.exports = { record, listForAsset, listSafeForAsset };
