const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  salary: {
    type: Number,
    required: [true, 'Please add a salary']
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'remote', 'internship', 'contract'],
    required: true,
    default: 'full-time'
  },
  category: {
    type: String,
    enum: ['Software Development', 'Design', 'Marketing', 'Sales', 'Customer Support', 'Finance', 'HR', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'pending', 'rejected'],
    default: 'pending'
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

jobSchema.index({ title: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ category: 1 });

// Virtual field for application count
jobSchema.virtual('applicationCount', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job',
  count: true
});

module.exports = mongoose.model('Job', jobSchema);
