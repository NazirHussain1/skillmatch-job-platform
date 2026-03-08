import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Plus,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Building2,
  TrendingUp,
  X
} from 'lucide-react';
import { getJobs, createJob } from '../features/jobs/jobSlice';
import { createApplication } from '../features/applications/applicationSlice';
import { saveJob, unsaveJob } from '../features/user/userSlice';
import Pagination from '../components/Pagination';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import JobForm from '../components/JobForm';

// JobCard Component
const JobCard = ({ job, user, isJobSaved, onSaveJob, onApply }) => {
  const postedDate = new Date(job.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - postedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const postedText = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  const saved = isJobSaved(job._id);

  return (
    <article
      className="job-card group relative overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-white"
      aria-label={`Job posting: ${job.title} at ${job.company}`}
    >
      {user?.role === 'jobseeker' && (
        <button
          type="button"
          onClick={() => onSaveJob(job._id)}
          className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 shadow-md z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          title={saved ? 'Remove from saved' : 'Save job'}
          aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
          aria-pressed={saved}
        >
          {saved ? (
            <BookmarkCheck className="w-5 h-5 fill-current" aria-hidden="true" />
          ) : (
            <Bookmark className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
          <Building2 className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-1">{job.company}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 capitalize">
            {job.jobType}
          </span>
          <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
            <DollarSign className="w-4 h-4" aria-hidden="true" />
            <span aria-label={`Salary: ${job.salary} dollars`}>{job.salary?.toLocaleString()}</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span className="truncate">{job.location}</span>
          </div>
          <time className="text-xs text-gray-500" dateTime={job.createdAt}>
            {postedText}
          </time>
        </div>
      </div>

      {user?.role === 'jobseeker' && (
        <button
          type="button"
          onClick={() => onApply(job._id)}
          className="btn-primary w-full"
          aria-label={`Apply for ${job.title} position`}
        >
          Apply Now
        </button>
      )}
    </article>
  );
};

// JobsFilterBar Component
const JobsFilterBar = ({ filters, onFilterChange, onSearch, onClearFilters, hasActiveFilters }) => {
  return (
    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl lg:sticky lg:top-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      <form onSubmit={onSearch} className="space-y-4">
        <div>
          <label htmlFor="filter-keyword" className="block text-sm font-medium text-gray-700 mb-2">
            Keywords
          </label>
          <input
            id="filter-keyword"
            type="text"
            placeholder="Job title, company..."
            value={filters.keyword}
            onChange={(event) => onFilterChange('keyword', event.target.value)}
            className="input-field"
            aria-label="Search by keywords"
          />
        </div>

        <div>
          <label htmlFor="filter-location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            id="filter-location"
            type="text"
            placeholder="City, state, or remote"
            value={filters.location}
            onChange={(event) => onFilterChange('location', event.target.value)}
            className="input-field"
            aria-label="Filter by location"
          />
        </div>

        <div>
          <label htmlFor="filter-job-type" className="block text-sm font-medium text-gray-700 mb-2">
            Job Type
          </label>
          <select
            id="filter-job-type"
            value={filters.jobType}
            onChange={(event) => onFilterChange('jobType', event.target.value)}
            className="input-field"
            aria-label="Filter by job type"
          >
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="remote">Remote</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(event) => onFilterChange('category', event.target.value)}
            className="input-field"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            <option value="Software Development">Software Development</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-salary" className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Salary
          </label>
          <select
            id="filter-salary"
            value={filters.salary}
            onChange={(event) => onFilterChange('salary', event.target.value)}
            className="input-field"
            aria-label="Filter by minimum salary"
          >
            <option value="">Any</option>
            <option value="30000">$30,000+</option>
            <option value="50000">$50,000+</option>
            <option value="70000">$70,000+</option>
            <option value="100000">$100,000+</option>
            <option value="150000">$150,000+</option>
          </select>
        </div>

        <button type="submit" className="btn-primary w-full" aria-label="Apply selected filters">
          Apply Filters
        </button>
      </form>
    </div>
  );
};

// EmptyJobsState Component
const EmptyJobsState = () => {
  return (
    <EmptyState
      type="search"
      title="No jobs found"
      description="Try adjusting your search filters or check back later for new opportunities"
    />
  );
};

// JobModal Component
const JobModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scroll-smooth shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-job-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-gray-100 z-10">
          <h2 id="post-job-title" className="text-2xl font-bold text-gray-900">
            Post a Job
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-2 transition-colors"
            aria-label="Close post job modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <JobForm
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

function Jobs() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { jobs, pagination, isLoading } = useSelector((state) => state.jobs);
  const { profile } = useSelector((state) => state.user);

  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    salary: '',
    category: '',
    jobType: ''
  });

  const [searchParams, setSearchParams] = useState({
    keyword: '',
    location: '',
    salary: '',
    category: '',
    jobType: '',
    page: 1,
    limit: 9
  });

  const effectiveSearchParams = useMemo(() => {
    if (user?.role === 'employer' && user?._id) {
      return {
        ...searchParams,
        employer: user._id
      };
    }

    return searchParams;
  }, [searchParams, user?._id, user?.role]);

  useEffect(() => {
    dispatch(getJobs(effectiveSearchParams));
  }, [dispatch, effectiveSearchParams]);

  useEffect(() => {
    if (!showModal) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowModal(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

  // Filter jobs by status (for employers)
  const filteredJobs = useMemo(() => {
    if (user?.role !== 'employer' || statusFilter === 'all') {
      return jobs;
    }
    return jobs.filter(job => job.status === statusFilter);
  }, [jobs, statusFilter, user?.role]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    if (user?.role !== 'employer') {
      return { all: jobs.length, active: 0, pending: 0, closed: 0 };
    }
    return {
      all: jobs.length,
      active: jobs.filter(j => j.status === 'active').length,
      pending: jobs.filter(j => j.status === 'pending').length,
      closed: jobs.filter(j => j.status === 'closed').length
    };
  }, [jobs, user?.role]);

  const handleCreateJob = async (jobData) => {
    try {
      setIsCreatingJob(true);
      const createdJob = await dispatch(createJob(jobData)).unwrap();
      if (createdJob?.status === 'pending') {
        toast.success('Job created and sent for admin approval');
      } else {
        toast.success('Job posted successfully');
      }
      setShowModal(false);
      dispatch(getJobs(effectiveSearchParams));
    } catch (error) {
      toast.error(error || 'Failed to post job');
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await dispatch(createApplication(jobId)).unwrap();
      toast.success('Application submitted');
    } catch (error) {
      toast.error(error || 'Failed to apply');
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      if (profile?.savedJobs?.includes(jobId)) {
        await dispatch(unsaveJob(jobId)).unwrap();
        toast.success('Job removed from saved');
      } else {
        await dispatch(saveJob(jobId)).unwrap();
        toast.success('Job saved');
      }
    } catch (error) {
      toast.error(error || 'Failed to save job');
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchParams({
      ...filters,
      page: 1,
      limit: 9
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      keyword: '',
      location: '',
      salary: '',
      category: '',
      jobType: ''
    };

    setFilters(clearedFilters);
    setSearchParams({
      ...clearedFilters,
      page: 1,
      limit: 9
    });
  };

  const handlePageChange = (page) => {
    setSearchParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isJobSaved = (jobId) => profile?.savedJobs?.includes(jobId);

  const hasActiveFilters =
    searchParams.keyword ||
    searchParams.location ||
    searchParams.salary ||
    searchParams.category ||
    searchParams.jobType;

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <div className="hero-gradient text-white py-8 sm:py-12 lg:py-16 mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl shadow-2xl mx-4 sm:mx-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
                <Briefcase className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true" />
                <span className="leading-tight">Discover Your Dream Job</span>
              </h1>
              <p className="text-blue-100 text-base sm:text-lg">
                {pagination?.total || 0} opportunities waiting for you
              </p>
            </div>
            {user?.role === 'employer' && (
              <button
                onClick={() => setShowModal(true)}
                className="btn bg-white text-blue-600 hover:bg-blue-50 shadow-xl w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
                aria-label="Post a new job"
              >
                <Plus className="w-5 h-5" aria-hidden="true" />
                Post Job
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters toggle */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label={showFilters ? 'Hide filters' : 'Show filters'}
          aria-expanded={showFilters}
        >
          <Filter className="w-4 h-4" aria-hidden="true" />
          <span>{showFilters ? 'Hide filters' : 'Show filters'}</span>
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Search className="w-4 h-4" aria-hidden="true" />
          <span>{pagination?.total || 0} jobs</span>
        </div>
      </div>

      {/* Status Filter Pills (for employers) */}
      {user?.role === 'employer' && (
        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Job status filters">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            role="tab"
            aria-selected={statusFilter === 'all'}
            aria-label={`All jobs, ${statusCounts.all} total`}
          >
            All <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{statusCounts.all}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${
              statusFilter === 'active'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            role="tab"
            aria-selected={statusFilter === 'active'}
            aria-label={`Active jobs, ${statusCounts.active} total`}
          >
            Active <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{statusCounts.active}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 ${
              statusFilter === 'pending'
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            role="tab"
            aria-selected={statusFilter === 'pending'}
            aria-label={`Pending jobs, ${statusCounts.pending} total`}
          >
            Pending <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{statusCounts.pending}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('closed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 ${
              statusFilter === 'closed'
                ? 'bg-gray-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            role="tab"
            aria-selected={statusFilter === 'closed'}
            aria-label={`Closed jobs, ${statusCounts.closed} total`}
          >
            Closed <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{statusCounts.closed}</span>
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <JobsFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Job Results */}
        <div className="flex-1 space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <SkeletonLoader type="card" count={9} />
            </div>
          ) : filteredJobs?.length > 0 ? (
            <>
              <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm sm:text-base text-gray-700 font-medium flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  {pagination?.total > 0 && (
                    <>
                      Showing{' '}
                      <span className="font-bold text-blue-600">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-bold text-blue-600">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-bold text-blue-600">{pagination.total}</span> opportunities
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    user={user}
                    isJobSaved={isJobSaved}
                    onSaveJob={handleSaveJob}
                    onApply={handleApply}
                  />
                ))}
              </div>

              <Pagination
                currentPage={pagination?.page || 1}
                totalPages={pagination?.pages || 1}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <EmptyJobsState />
          )}
        </div>
      </div>

      <JobModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateJob}
        isLoading={isCreatingJob}
      />
    </div>
  );
}

export default Jobs;
