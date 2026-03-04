import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getJobs, createJob } from '../features/jobs/jobSlice';
import { createApplication } from '../features/applications/applicationSlice';
import { Briefcase, MapPin, DollarSign, Plus, X, Search, Filter } from 'lucide-react';
import Pagination from '../components/Pagination';

function Jobs() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { jobs, pagination, isLoading } = useSelector((state) => state.jobs);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salary: '',
  });

  // Search and filter state
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    salary: '',
  });

  const [searchParams, setSearchParams] = useState({
    keyword: '',
    location: '',
    salary: '',
    page: 1,
    limit: 9,
  });

  useEffect(() => {
    dispatch(getJobs(searchParams));
  }, [dispatch, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createJob({ ...formData, salary: Number(formData.salary) })).unwrap();
      toast.success('Job posted successfully!');
      setShowModal(false);
      setFormData({ title: '', company: '', description: '', location: '', salary: '' });
    } catch (error) {
      toast.error(error || 'Failed to post job');
    }
  };

  const handleApply = async (jobId) => {
    try {
      await dispatch(createApplication(jobId)).unwrap();
      toast.success('Application submitted!');
    } catch (error) {
      toast.error(error || 'Failed to apply');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({
      ...filters,
      page: 1, // Reset to page 1 when searching
      limit: 9,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      salary: '',
    });
    setSearchParams({
      keyword: '',
      location: '',
      salary: '',
      page: 1,
      limit: 9,
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };

  const handlePageChange = (page) => {
    setSearchParams({
      ...searchParams,
      page,
    });
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="text-gray-600 mt-1">Find your next opportunity</p>
        </div>
        {user?.role === 'employer' && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-5 h-5" />
            Post Job
          </button>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by job title, company, or keywords..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </div>

          {/* Filter Dropdowns */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., New York, Remote"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary
                </label>
                <select
                  value={filters.salary}
                  onChange={(e) => handleFilterChange('salary', e.target.value)}
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
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Active Filters Display */}
        {(searchParams.keyword || searchParams.location || searchParams.salary) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchParams.keyword && (
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                Keyword: {searchParams.keyword}
                <button
                  onClick={() => {
                    setFilters({ ...filters, keyword: '' });
                    setSearchParams({ ...searchParams, keyword: '', page: 1 });
                  }}
                  className="hover:text-primary-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchParams.location && (
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                Location: {searchParams.location}
                <button
                  onClick={() => {
                    setFilters({ ...filters, location: '' });
                    setSearchParams({ ...searchParams, location: '', page: 1 });
                  }}
                  className="hover:text-primary-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchParams.salary && (
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                Salary: ${parseInt(searchParams.salary).toLocaleString()}+
                <button
                  onClick={() => {
                    setFilters({ ...filters, salary: '' });
                    setSearchParams({ ...searchParams, salary: '', page: 1 });
                  }}
                  className="hover:text-primary-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {pagination?.total > 0 ? (
                <>
                  Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-semibold">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-semibold">{pagination.total}</span> job{pagination.total !== 1 ? 's' : ''}
                </>
              ) : (
                'No jobs found'
              )}
            </p>
          </div>

          {/* Jobs Grid */}
          {jobs?.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div key={job._id} className="card hover-lift">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-4">{job.company}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">${job.salary?.toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>
                    {user?.role === 'jobseeker' && (
                      <button
                        onClick={() => handleApply(job._id)}
                        className="btn-primary w-full"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={pagination?.page || 1}
                totalPages={pagination?.pages || 1}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search filters</p>
            </div>
          )}
        </>
      )}

      {/* Create Job Modal */}
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
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="input"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows="3"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                required
              />
              <input
                type="number"
                placeholder="Salary"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="input"
                required
              />
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
