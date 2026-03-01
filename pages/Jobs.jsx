import React, { useState, useEffect } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { Job } from '../types';
import JobCard from '../components/JobCard';
import { JobCardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { StaggerContainer, StaggerItem } from '../components/PageTransition';
import { Search, Filter, MapPin, Briefcase, Clock, Loader2 } from 'lucide-react';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
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
      console.error('Error loading jobs);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!user) return;
    
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      await apiService.createApplication({
        jobId);

      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying to job);
      toast.error(error.message || 'Failed to submit application');
    }
  };

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
  const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Remote'];

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="select pl-10 min-w-[200px]"
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
              className="select pl-10 min-w-[150px]"
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
            className="btn-secondary"
          >
            <Filter size={20} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md)}
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
        <div className="grid grid-cols-1 lg) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <StaggerContainer>
          <div className="grid grid-cols-1 lg) => user && (
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
            label) => {
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
          <button className="btn-secondary px-8">
            Load More Jobs
          </button>
        </div>
      )}
    </>
  );
};

export default Jobs;
