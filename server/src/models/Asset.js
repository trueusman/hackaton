const mongoose = require('mongoose');
const { ALL_ASSET_STATUSES, ASSET_STATUS } = require('../constants/assetStatus');

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];

const assetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      required: true,
      unique: true,
      immutable: true, // QR encodes this - it must never change after creation
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    condition: { type: String, enum: CONDITIONS, default: 'Good' },
    status: {
      type: String,
      enum: ALL_ASSET_STATUSES,
      default: ASSET_STATUS.OPERATIONAL,
      index: true,
    },

    description: { type: String, trim: true, maxlength: 2000 },
    model: { type: String, trim: true },
    serialNumber: { type: String, trim: true }, // private - never on public projection

    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    lastServiceDate: { type: Date, default: null },
    nextServiceDate: { type: Date, default: null },

    purchaseCost: { type: Number, min: 0, default: null }, // private
    purchaseDate: { type: Date, default: null },

    qrPublicUrl: { type: String }, // derived, stored for convenience/debugging only

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

assetSchema.index({ name: 'text', category: 'text', location: 'text' });

// Fields safe to expose on the public (no-auth) asset page. Anything not
// listed here is structurally excluded, not filtered after the fact.
assetSchema.statics.PUBLIC_PROJECTION =
  'assetCode name category location condition status lastServiceDate nextServiceDate createdAt';

module.exports = mongoose.model('Asset', assetSchema);
module.exports.CONDITIONS = CONDITIONS;
