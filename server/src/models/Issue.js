const mongoose = require('mongoose');
const { ALL_ISSUE_STATUSES, ISSUE_STATUS, ALL_PRIORITIES, PRIORITY } = require('../constants/issueStatus');

// Tracks provenance for any field the AI suggested, per the brief's
// "store whether a field was AI-suggested and whether the user edited it".
const aiFieldSchema = new mongoose.Schema(
  {
    value: mongoose.Schema.Types.Mixed,
    aiSuggested: { type: Boolean, default: false },
    userEdited: { type: Boolean, default: false },
  },
  { _id: false },
);

const evidenceSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: { type: String, enum: ['image', 'video'], default: 'image' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const issueSchema = new mongoose.Schema(
  {
    issueNumber: { type: String, required: true, unique: true, immutable: true, index: true },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    category: { type: String, trim: true, default: 'General' },
    priority: { type: String, enum: ALL_PRIORITIES, default: PRIORITY.MEDIUM },

    status: {
      type: String,
      enum: ALL_ISSUE_STATUSES,
      default: ISSUE_STATUS.REPORTED,
      index: true,
    },

    reporterName: { type: String, trim: true },
    reporterContact: { type: String, trim: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // set if logged-in user reported

    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    evidence: { type: [evidenceSchema], default: [] },

    // AI Issue Triage provenance
    aiTriage: {
      title: aiFieldSchema,
      category: aiFieldSchema,
      priority: aiFieldSchema,
      possibleCauses: aiFieldSchema,
      initialChecks: aiFieldSchema,
      recurringPatternWarning: aiFieldSchema,
      raw: { type: mongoose.Schema.Types.Mixed, default: null },
      triagedAt: { type: Date, default: null },
    },

    resolutionSummary: { type: String, trim: true, default: null },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

issueSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Issue', issueSchema);
