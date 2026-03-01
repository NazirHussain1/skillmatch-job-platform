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
    enum: ['pending', 'reviewing', 'interviewing', 'accepted', 'rejected'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot be more than 1000 characters']
  },
  resume: {
    type: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Update job applications count when application is created
applicationSchema.post('save', async function() {
  const Job = mongoose.model('Job');
  await Job.findByIdAndUpdate(this.job, {
    $inc: { applicationsCount: 1 }
  });
});

// Update job applications count when application is deleted
applicationSchema.post('remove', async function() {
  const Job = mongoose.model('Job');
  await Job.findByIdAndUpdate(this.job, {
    $inc: { applicationsCount: -1 }
  });
});

module.exports = mongoose.model('Application', applicationSchema);
