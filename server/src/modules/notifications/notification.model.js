import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'application_submitted',
      'application_reviewed',
      'application_accepted',
      'application_rejected',
      'new_message',
      'job_recommendation'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedEntityType: {
    type: String,
    enum: ['Job', 'Application', 'User']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000 // 90 days
  }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ deletedAt: 1 });

// Query middleware to exclude soft-deleted documents by default
notificationSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

// Instance method for soft delete
notificationSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Instance method to restore soft-deleted document
notificationSchema.methods.restore = function() {
  this.deletedAt = null;
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
