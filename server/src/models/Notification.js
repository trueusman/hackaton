const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['ISSUE_ASSIGNED', 'ISSUE_STATUS_CHANGED', 'ISSUE_RESOLVED', 'MAINTENANCE_DUE'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
