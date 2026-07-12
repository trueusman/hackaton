const mongoose = require('mongoose');

// Append-only audit trail. There is deliberately no update/delete route for
// this collection anywhere in the API - see services/historyService.js.
const historySchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
    issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    actorName: { type: String, trim: true, default: 'System' },
    action: { type: String, required: true },
    message: { type: String, required: true, trim: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

historySchema.index({ asset: 1, createdAt: -1 });

module.exports = mongoose.model('History', historySchema);
