import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewing', 'Interviewing', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  optimisticConcurrency: true // Enable optimistic concurrency control
});

// Indexes for performance
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ userId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ deletedAt: 1 }); // For soft delete queries

// Pre-save validation hook
applicationSchema.pre('save', function(next) {
  // Validate status transitions
  if (this.isModified('status')) {
    const validTransitions = {
      'Pending': ['Reviewing', 'Rejected'],
      'Reviewing': ['Interviewing', 'Accepted', 'Rejected'],
      'Interviewing': ['Accepted', 'Rejected'],
      'Accepted': [],
      'Rejected': []
    };

    const previousStatus = this._previousStatus || 'Pending';
    const allowedStatuses = validTransitions[previousStatus] || [];

    if (previousStatus !== this.status && !allowedStatuses.includes(this.status)) {
      return next(new Error(`Invalid status transition from ${previousStatus} to ${this.status}`));
    }
  }

  next();
});

// Store previous status for validation
applicationSchema.pre('save', function(next) {
  if (!this.isNew && this.isModified('status')) {
    this._previousStatus = this._original?.status;
  }
  next();
});

// Query middleware to exclude soft-deleted documents by default
applicationSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

// Instance method for soft delete
applicationSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Instance method to restore soft-deleted document
applicationSchema.methods.restore = function() {
  this.deletedAt = null;
  return this.save();
};

// Static method to find including deleted
applicationSchema.statics.findWithDeleted = function(conditions) {
  return this.find(conditions).setOptions({ includeDeleted: true });
};

const Application = mongoose.model('Application', applicationSchema);

export default Application;
