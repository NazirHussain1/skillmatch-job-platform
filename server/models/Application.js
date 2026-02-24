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
  }
}, {
  timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
