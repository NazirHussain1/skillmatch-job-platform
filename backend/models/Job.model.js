const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
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
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote'],
    default: 'Full-time'
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  postedAt: {
    type: String,
    default: () => new Date().toLocaleDateString()
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
