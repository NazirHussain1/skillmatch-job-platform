import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { Job } from '../types';
import JobCard from '../components/JobCard';
import { JobCardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { StaggerContainer, StaggerItem } from '../components/PageTransition';
import { Search, Filter, MapPin, Briefcase, Clock, Loader2 } from 'lucide-react';

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [searchQuery, locationFilter, typeFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchQuery || undefined,
        location: locationFilter || undefined,
        type: typeFilter || undefined,
      };
      const jobsData = await apiService.getJobs(filters);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;
    
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      await apiService.createApplication({
        jobId: job.id,
        userId: user.id,
        jobTitle: job.title,
        companyName: job.companyName,
        status: 'Pending',
        matchScore: 85,
      });

      toast.success('Application submitted successfully!');
    } catch (error: any) {
      console.error('Error applying to job:', error);
      toast.error(error.message || 'Failed to submit application');
    }
  };

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
  const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Remote'];

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Find Your Next Opportunity</h1>
        <p className="text-gray-600">
          Discover jobs that match your skills and career goals with AI-powered recommendations.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card bg-white p-4 sm:p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[200px] transition-all duration-200"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Job Type Filter */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[150px] transition-all duration-200"
            >
              <option value="">All Types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Filter size={20} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200">
                  <option>Any Salary</option>
                  <option>$50k - $75k</option>
                  <option>$75k - $100k</option>
                  <option>$100k - $150k</option>
                  <option>$150k+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200">
                  <option>Any Level</option>
                  <option>Entry Level</option>
                  <option>Mid Level</option>
                  <option>Senior Level</option>
                  <option>Executive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posted Date
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200">
                  <option>Any Time</option>
                  <option>Last 24 hours</option>
                  <option>Last 3 days</option>
                  <option>Last week</option>
                  <option>Last month</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {loading ? 'Loading...' : `${jobs.length} Jobs Found`}
          </h2>
          {user && (
            <span className="text-sm text-primary-700 bg-primary-50 px-3 py-1 rounded-full font-medium">
              AI-Matched for You
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} className="text-gray-400" />
          <span>Updated 5 minutes ago</span>
        </div>
      </div>

      {/* Job Listings */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <StaggerContainer>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.map((job) => user && (
              <StaggerItem key={job.id}>
                <JobCard
                  job={job}
                  user={user}
                  onApply={handleApply}
                />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      ) : (
        <EmptyState
          icon="search"
          title="No jobs found"
          description="Try adjusting your search criteria or filters to find more opportunities."
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearchQuery('');
              setLocationFilter('');
              setTypeFilter('');
            }
          }}
        />
      )}

      {/* Load More Button */}
      {jobs.length > 0 && jobs.length % 12 === 0 && (
        <div className="text-center mt-12">
          <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
            Load More Jobs
          </button>
        </div>
      )}
    </>
  );
};

export default Jobs;