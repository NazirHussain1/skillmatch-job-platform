const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'interview', 'offer', 'hired', 'accepted', 'rejected'],
    default: 'pending'
  },
  employerNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    default: ''
  },
  interviewDate: {
    type: Date
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'interview', 'offer', 'hired', 'accepted', 'rejected'],
      required: true
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ interviewDate: 1 });

module.exports = mongoose.model('Application', applicationSchema);
