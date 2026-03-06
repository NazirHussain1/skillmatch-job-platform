import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Plus,
  X,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Building2,
  TrendingUp
} from 'lucide-react';
import { getJobs, createJob } from '../features/jobs/jobSlice';
import { createApplication } from '../features/applications/applicationSlice';
import { saveJob, unsaveJob } from '../features/user/userSlice';
import Pagination from '../components/Pagination';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

function Jobs() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { jobs, pagination, isLoading } = useSelector((state) => state.jobs);
  const { profile } = useSelector((state) => state.user);

  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salary: '',
    jobType: 'full-time',
    category: ''
  });

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

  useEffect(() => {
    dispatch(getJobs(searchParams));
  }, [dispatch, searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await dispatch(createJob({ ...formData, salary: Number(formData.salary) })).unwrap();
      toast.success('Job posted successfully');
      setShowModal(false);
      setFormData({
        title: '',
        company: '',
        description: '',
        location: '',
        salary: '',
        jobType: 'full-time',
        category: ''
      });
      dispatch(getJobs(searchParams));
    } catch (error) {
      toast.error(error || 'Failed to post job');
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
                <Briefcase className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="leading-tight">Discover Your Dream Job</span>
              </h1>
              <p className="text-blue-100 text-base sm:text-lg">
                {pagination?.total || 0} opportunities waiting for you
              </p>
            </div>
            {user?.role === 'employer' && (
              <button
                onClick={() => setShowModal(true)}
                className="btn bg-white text-blue-600 hover:bg-blue-50 shadow-xl w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                Post Job
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
          <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={filters.keyword}
                  onChange={(event) => handleFilterChange('keyword', event.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="btn-secondary flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button type="submit" className="btn-primary">
                Search
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., New York, Remote"
                    value={filters.location}
                    onChange={(event) => handleFilterChange('location', event.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    value={filters.jobType}
                    onChange={(event) => handleFilterChange('jobType', event.target.value)}
                    className="input-field"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(event) => handleFilterChange('category', event.target.value)}
                    className="input-field"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary</label>
                  <select
                    value={filters.salary}
                    onChange={(event) => handleFilterChange('salary', event.target.value)}
                    className="input-field"
                  >
                    <option value="">Any</option>
                    <option value="30000">$30,000+</option>
                    <option value="50000">$50,000+</option>
                    <option value="70000">$70,000+</option>
                    <option value="100000">$100,000+</option>
                    <option value="150000">$150,000+</option>
                  </select>
                </div>
              </div>
            )}

            {showFilters && (filters.location || filters.jobType || filters.category || filters.salary) && (
              <div className="pt-4">
                <button type="button" onClick={handleClearFilters} className="btn-secondary">
                  Clear All Filters
                </button>
              </div>
            )}
          </form>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchParams.keyword && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  Keyword: {searchParams.keyword}
                </span>
              )}
              {searchParams.location && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  Location: {searchParams.location}
                </span>
              )}
              {searchParams.salary && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  Salary: ${parseInt(searchParams.salary, 10).toLocaleString()}+
                </span>
              )}
              {searchParams.category && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  Category: {searchParams.category}
                </span>
              )}
              {searchParams.jobType && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  Type: {searchParams.jobType}
                </span>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonLoader type="card" count={9} />
          </div>
        ) : jobs?.length > 0 ? (
          <>
            <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-gray-700 font-medium flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                {pagination?.total > 0 && (
                  <>
                    Showing <span className="font-bold text-blue-600">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-bold text-blue-600">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-bold text-blue-600">{pagination.total}</span> opportunities
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job._id} className="job-card group relative overflow-hidden">
                  {user?.role === 'jobseeker' && (
                    <button
                      onClick={() => handleSaveJob(job._id)}
                      className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 shadow-md z-10"
                      title={isJobSaved(job._id) ? 'Remove from saved' : 'Save job'}
                    >
                      {isJobSaved(job._id) ? (
                        <BookmarkCheck className="w-5 h-5 fill-current" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Building2 className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 font-medium line-clamp-1">{job.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.jobType && <span className="badge-primary">{job.jobType}</span>}
                    {job.category && <span className="badge-secondary">{job.category}</span>}
                  </div>

                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium line-clamp-1">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-bold text-green-600">${job.salary?.toLocaleString()}/year</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{job.description}</p>

                  {user?.role === 'jobseeker' && (
                    <button
                      onClick={() => handleApply(job._id)}
                      className="btn-primary w-full group-hover:scale-105 transition-transform"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Pagination
              currentPage={pagination?.page || 1}
              totalPages={pagination?.pages || 1}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <EmptyState
            type="search"
            title="No jobs found"
            description="Try adjusting your search filters or check back later for new opportunities"
          />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Post a Job</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Job Title"
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(event) => setFormData((prev) => ({ ...prev, company: event.target.value }))}
                className="input"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                className="input"
                rows="3"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                className="input"
                required
              />
              <input
                type="number"
                placeholder="Salary"
                value={formData.salary}
                onChange={(event) => setFormData((prev) => ({ ...prev, salary: event.target.value }))}
                className="input"
                required
              />
              <select
                value={formData.jobType}
                onChange={(event) => setFormData((prev) => ({ ...prev, jobType: event.target.value }))}
                className="input"
                required
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="remote">Remote</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
              <select
                value={formData.category}
                onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
                className="input"
                required
              >
                <option value="">Select Category</option>
                <option value="Software Development">Software Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Other">Other</option>
              </select>
              <button type="submit" className="btn-primary w-full">
                Post Job
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;
