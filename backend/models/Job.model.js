const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
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
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'remote', 'internship'],
    default: 'full-time'
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead'],
    default: 'entry'
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search optimization
jobSchema.index({ title: 'text', description: 'text', companyName: 'text' });
jobSchema.index({ employer: 1, isActive: 1 });

module.exports = mongoose.model('Job', jobSchema);
