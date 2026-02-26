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
  }]
}, {
  timestamps: true
});

jobSchema.index({ title: 'text', description: 'text', companyName: 'text' });

const Job = mongoose.model('Job', jobSchema);

export default Job;
