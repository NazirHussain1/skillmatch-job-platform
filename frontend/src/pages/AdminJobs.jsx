import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import adminService from '../services/adminService';
import { Briefcase, Trash2, CheckCircle, XCircle, Clock, Filter, Building2, MapPin, DollarSign } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, jobId: null, jobTitle: '' });
  const [actionLoading, setActionLoading] = useState(null);

  const fetchJobs = async (status = 'all', page = 1) => {
    try {
      setIsLoading(true);
      let data;
      
      if (status === 'all') {
        data = await adminService.getAllJobs({ page, limit: 10 });
      } else {
        data = await adminService.getJobsByStatus(status, { page, limit: 10 });
      }
      
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(statusFilter);
  }, [statusFilter]);

  const handleDelete = async () => {
    try {
      await adminService.deleteJob(deleteDialog.jobId);
      toast.success('Job deleted successfully');
      setDeleteDialog({ isOpen: false, jobId: null, jobTitle: '' });
      fetchJobs(statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    }
  };

  const handleApprove = async (jobId) => {
    try {
      setActionLoading(jobId);
      await adminService.approveJob(jobId);
      toast.success('Job approved successfully');
      fetchJobs(statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (jobId) => {
    try {
      setActionLoading(jobId);
      await adminService.rejectJob(jobId);
      toast.success('Job rejected successfully');
      fetchJobs(statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject job');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      pending: 'badge-warning',
      rejected: 'badge-danger',
      closed: 'badge-secondary',
      draft: 'badge-secondary'
    };
    return badges[status] || 'badge-secondary';
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-1">Moderate and manage all job postings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter by Status</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'active', 'rejected', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              {status === 'all' ? 'All Jobs' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          <SkeletonLoader type="card" count={5} />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          type="jobs"
          title="No jobs found"
          description={`No ${statusFilter === 'all' ? '' : statusFilter} jobs to display`}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-gray-600 font-medium">{job.company}</p>
                    </div>
                    <span className={`badge ${getStatusBadge(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.jobType && (
                      <span className="badge-primary">
                        {job.jobType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    )}
                    {job.category && (
                      <span className="badge-secondary">{job.category}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-green-600">${job.salary?.toLocaleString()}/year</span>
                    </div>
                  </div>

                  {job.employer && (
                    <p className="text-sm text-gray-500">
                      Posted by: <span className="font-medium">{job.employer.name}</span>
                      {job.employer.companyName && ` (${job.employer.companyName})`}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:w-48">
                  {job.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(job._id)}
                        disabled={actionLoading === job._id}
                        className="btn-success flex-1 lg:flex-none"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {actionLoading === job._id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(job._id)}
                        disabled={actionLoading === job._id}
                        className="btn bg-red-600 text-white hover:bg-red-700 flex-1 lg:flex-none"
                      >
                        <XCircle className="w-4 h-4" />
                        {actionLoading === job._id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </>
                  )}
                  {job.status === 'rejected' && (
                    <button
                      onClick={() => handleApprove(job._id)}
                      disabled={actionLoading === job._id}
                      className="btn-success flex-1 lg:flex-none"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading === job._id ? 'Approving...' : 'Approve'}
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteDialog({ isOpen: true, jobId: job._id, jobTitle: job.title })}
                    className="btn bg-red-100 text-red-600 hover:bg-red-200 flex-1 lg:flex-none"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(pagination.pages)].map((_, index) => (
            <button
              key={index}
              onClick={() => fetchJobs(statusFilter, index + 1)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                pagination.page === index + 1
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, jobId: null, jobTitle: '' })}
        onConfirm={handleDelete}
        title="Delete Job"
        message={`Are you sure you want to delete "${deleteDialog.jobTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}

export default AdminJobs;
