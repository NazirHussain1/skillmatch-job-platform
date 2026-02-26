import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true
  },
  filters: {
    location: String,
    type: String,
    skills: [String],
    salaryMin: Number,
    salaryMax: Number,
    experienceLevel: String
  },
  resultCount: {
    type: Number,
    default: 0
  },
  searchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

searchHistorySchema.index({ userId: 1, searchedAt: -1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
