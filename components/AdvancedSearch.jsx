import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, MapPin, Briefcase, DollarSign, Clock, History } from 'lucide-react';
import toast from 'react-hot-toast';

const AdvancedSearch = ({ onSearch, onResultsChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    skills: ''
  });

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (6+ years)' }
  ];

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/search/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSearchHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch search history:', error);
    }
  };

  const handleSearch = async (query = searchQuery, customFilters = filters) => {
    const params = new URLSearchParams();
    
    if (query) params.append('search', query);
    if (customFilters.location) params.append('location', customFilters.location);
    if (customFilters.type) params.append('type', customFilters.type);
    if (customFilters.experienceLevel) params.append('experienceLevel', customFilters.experienceLevel);
    if (customFilters.salaryMin) params.append('salaryMin', customFilters.salaryMin);
    if (customFilters.salaryMax) params.append('salaryMax', customFilters.salaryMax);
    if (customFilters.skills) params.append('skills', customFilters.skills);

    try {
      const response = await fetch(`http://localhost:5000/api/search/jobs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        if (onResultsChange) {
          onResultsChange(data.data);
        }
        if (onSearch) {
          onSearch(data.data.jobs);
        }
        setShowHistory(false);
        fetchSearchHistory();
      }
    } catch (error) {
      toast.error('Search failed');
      console.error('Search error:', error);
    }
  };

  const handleHistoryClick = (historyItem) => {
    setSearchQuery(historyItem.query);
    setFilters(historyItem.filters || {});
    handleSearch(historyItem.query, historyItem.filters || {});
  };

  const clearHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/search/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSearchHistory([]);
      toast.success('Search history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      type: '',
      experienceLevel: '',
      salaryMin: '',
      salaryMax: '',
      skills: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search jobs by title, skills, or company..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            
            {/* Search History Dropdown */}
            <AnimatePresence>
              {showHistory && searchHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto"
                >
                  <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Recent Searches
                    </span>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear all
                    </button>
                  </div>
                  {searchHistory.map((item, index) => (
                    <motion.button
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleHistoryClick(item)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-sm text-gray-700">{item.query}</span>
                      <span className="text-xs text-gray-400">{item.resultCount} results</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSearch()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Search
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-lg transition-colors relative ${
              showFilters ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            {activeFiltersCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
              >
                {activeFiltersCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                {activeFiltersCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear filters
                  </motion.button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder="e.g., Remote, New York"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Job Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Experience Level
                  </label>
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                {/* Salary Min */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Min Salary
                  </label>
                  <input
                    type="number"
                    value={filters.salaryMin}
                    onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                    placeholder="e.g., 50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Salary Max */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Max Salary
                  </label>
                  <input
                    type="number"
                    value={filters.salaryMax}
                    onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
                    placeholder="e.g., 150000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={filters.skills}
                    onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                    placeholder="e.g., React, Node.js, Python"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSearch()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch;
