import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  salary: {
    type: String,
    required: [true, 'Please add a salary range'],
    trim: true
  },
  salaryRange: {
    type: Number,
    default: 0
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior'],
    default: 'entry'
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote'],
    required: [true, 'Please add a job type']
  },
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  postedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  uniqueViewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  applicationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Weighted text index for relevance scoring
jobSchema.index({
  title: 'text',
  requiredSkills: 'text',
  companyName: 'text',
  description: 'text'
}, {
  weights: {
    title: 10,
    requiredSkills: 5,
    companyName: 3,
    description: 1
  },
  name: 'job_search_index'
});

// Additional indexes for performance
jobSchema.index({ employerId: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ postedAt: -1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ salaryRange: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ applicationCount: -1 });
jobSchema.index({ views: -1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
