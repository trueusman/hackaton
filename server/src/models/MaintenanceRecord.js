const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: { type: String, enum: ['image', 'video'], default: 'image' },
  },
  { _id: false },
);

const partSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, min: 1, default: 1 },
    cost: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

const maintenanceRecordSchema = new mongoose.Schema(
  {
    issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true, index: true },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    inspectionNotes: { type: String, trim: true, maxlength: 3000 },
    technicianNotes: { type: String, trim: true, maxlength: 3000 },
    workPerformed: { type: String, trim: true, maxlength: 3000 },

    parts: { type: [partSchema], default: [] },
    totalCost: {
      type: Number,
      min: [0, 'Maintenance cost cannot be negative'],
      default: 0,
    },

    timeSpentMinutes: { type: Number, min: 0, default: null },
    finalCondition: { type: String, trim: true, default: null },

    evidence: { type: [evidenceSchema], default: [] },

    completionDate: { type: Date, default: null },
    nextServiceDate: { type: Date, default: null },
  },
  { timestamps: true },
);

// Business rule: next service date cannot be before completion date.
maintenanceRecordSchema.pre('validate', function enforceServiceDateOrder(next) {
  if (this.completionDate && this.nextServiceDate) {
    if (this.nextServiceDate < this.completionDate) {
      return next(new Error('Next service date cannot be before the maintenance completion date'));
    }
  }
  next();
});

module.exports = mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
