import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEmployerJobs, createJob, updateJob, deleteJob, reset } from '../features/jobs/jobSlice';
import JobForm from '../components/JobForm';
import ConfirmDialog from '../components/ConfirmDialog';
import SkeletonLoader from '../components/SkeletonLoader';

const JobsHeader = ({ onCreate }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
      <p className="text-gray-600 mt-1 text-sm">
        Manage your job listings and review applicants in one place.
      </p>
    </div>
    <button
      type="button"
      onClick={onCreate}
      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors"
    >
      <Plus size={18} />
      Create Job
    </button>
  </div>
);

const JobsFilterBar = ({ statusFilter, onChange, total }) => {
  const filters = [
    { id: 'all', label: 'All jobs' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'closed', label: 'Closed' }
  ];

  return (
    <section
      className="mb-6 bg-white/80 border border-gray-100 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      aria-label="Filter jobs"
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-gray-900">Filters</p>
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-blue-600">{total}</span> job
          {total === 1 ? '' : 's'}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
              statusFilter === filter.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-300'
            }`}
            aria-pressed={statusFilter === filter.id}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </section>
  );
};

const EmptyJobsState = ({ onCreate }) => (
  <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
    <div className="text-gray-300 mb-4 flex justify-center">
      <Users size={64} />
    </div>
    <h2 className="text-2xl font-semibold text-gray-800 mb-2">No jobs posted yet</h2>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      Start by creating your first job posting to attract qualified candidates.
    </p>
    <button
      type="button"
      onClick={onCreate}
      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors"
    >
      <Plus size={18} />
      Create your first job
    </button>
  </div>
);

const JobCard = ({ job, onViewApplicants, onEdit, onDelete, formatDate, formatSalary }) => (
  <article className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-white">
    <div className="flex justify-between items-start mb-4 gap-3">
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {job.title}
        </h3>
        <p className="text-sm text-gray-600 font-medium truncate mt-1">{job.company}</p>
      </div>
      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 whitespace-nowrap">
        {job.applicationCount || 0} applicants
      </span>
    </div>

    <div className="flex flex-wrap gap-2 mb-3">
      {job.jobType && (
        <span className="inline-flex items-center px-3 py-1 text-[11px] font-medium rounded-full bg-primary-100 text-primary-700 capitalize">
          {job.jobType === 'full-time' && 'Full Time'}
          {job.jobType === 'part-time' && 'Part Time'}
          {job.jobType === 'remote' && 'Remote'}
          {job.jobType === 'internship' && 'Internship'}
          {job.jobType === 'contract' && 'Contract'}
        </span>
      )}
      {job.category && (
        <span className="inline-flex items-center px-3 py-1 text-[11px] font-medium rounded-full bg-purple-100 text-purple-700">
          {job.category}
        </span>
      )}
    </div>

    <p className="text-sm text-gray-600 mb-1 truncate">{job.location}</p>
    <p className="text-sm font-semibold text-green-600 mb-1">
      {formatSalary(job.salary)}
      <span className="text-xs text-gray-500 font-normal"> / year</span>
    </p>
    <p className="text-xs text-gray-400 mb-4">Posted on {formatDate(job.createdAt)}</p>

    <div className="border-t pt-4 flex items-center gap-2">
      <button
        type="button"
        onClick={onViewApplicants}
        className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-50 text-gray-800 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors"
      >
        <Users size={16} />
        View applicants
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-3 py-2 rounded-xl hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors"
        aria-label={`Edit job ${job.title}`}
      >
        <Edit size={16} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center justify-center bg-red-50 text-red-700 px-3 py-2 rounded-xl hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-colors"
        aria-label={`Delete job ${job.title}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  </article>
);

const JobModal = ({ isOpen, title, onClose, onSubmit, initialData, isSubmitting }) => {
  if (!isOpen) return null;

  const modalId = title?.toLowerCase().includes('edit') ? 'edit-job-modal-title' : 'create-job-modal-title';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
        aria-hidden="true"
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id={modalId} className="text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => !isSubmitting && onClose()}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Close job modal"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>
        <JobForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
};

const MyJobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employerJobs, isLoading, isError, message } = useSelector(state => state.jobs);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAnyOverlayOpen = showCreateModal || showEditModal || showDeleteDialog;
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(getEmployerJobs());
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  useEffect(() => {
    if (!isAnyOverlayOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleEscapeClose = (event) => {
      if (event.key !== 'Escape' || isSubmitting) {
        return;
      }

      if (showDeleteDialog) {
        setShowDeleteDialog(false);
        setSelectedJob(null);
        return;
      }

      if (showEditModal) {
        setShowEditModal(false);
        setSelectedJob(null);
        return;
      }

      if (showCreateModal) {
        setShowCreateModal(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscapeClose);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscapeClose);
    };
  }, [isAnyOverlayOpen, isSubmitting, showCreateModal, showDeleteDialog, showEditModal]);

  const handleCreateJob = async (jobData) => {
    setIsSubmitting(true);
    try {
      await dispatch(createJob(jobData)).unwrap();
      toast.success('Job created successfully');
      setShowCreateModal(false);
      dispatch(getEmployerJobs());
    } catch (error) {
      toast.error(error || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditJob = async (jobData) => {
    setIsSubmitting(true);
    try {
      await dispatch(updateJob({ id: selectedJob._id, jobData })).unwrap();
      toast.success('Job updated successfully');
      setShowEditModal(false);
      setSelectedJob(null);
      dispatch(getEmployerJobs());
    } catch (error) {
      toast.error(error || 'Failed to update job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(deleteJob(selectedJob._id)).unwrap();
      toast.success('Job deleted successfully');
      setShowDeleteDialog(false);
      setSelectedJob(null);
      dispatch(getEmployerJobs());
    } catch (error) {
      toast.error(error || 'Failed to delete job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (job) => {
    setSelectedJob(job);
    setShowEditModal(true);
  };

  const openDeleteDialog = (job) => {
    setSelectedJob(job);
    setShowDeleteDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(salary);
  };

  const filteredJobs =
    statusFilter === 'all'
      ? employerJobs
      : employerJobs.filter((job) => job.status === statusFilter);

  if (isLoading && employerJobs.length === 0) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <JobsHeader onCreate={() => {}} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonLoader type="card" count={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <JobsHeader onCreate={() => setShowCreateModal(true)} />

      {employerJobs.length > 0 && (
        <JobsFilterBar
          statusFilter={statusFilter}
          onChange={setStatusFilter}
          total={filteredJobs.length}
        />
      )}

      {/* Empty State */}
      {employerJobs.length === 0 ? (
        <EmptyJobsState onCreate={() => setShowCreateModal(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              formatDate={formatDate}
              formatSalary={formatSalary}
              onViewApplicants={() => navigate(`/job-applicants/${job._id}`)}
              onEdit={() => openEditModal(job)}
              onDelete={() => openDeleteDialog(job)}
            />
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      <JobModal
        isOpen={showCreateModal}
        title="Create new job"
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateJob}
        isSubmitting={isSubmitting}
      />

      {/* Edit Job Modal */}
      <JobModal
        isOpen={showEditModal && !!selectedJob}
        title="Edit job"
        onClose={() => {
          setShowEditModal(false);
          setSelectedJob(null);
        }}
        onSubmit={handleEditJob}
        initialData={selectedJob}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Job"
        message="Are you sure you want to delete this job? This action is permanent and will remove all associated applications."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteJob}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedJob(null);
        }}
      />
    </div>
  );
};

export default MyJobs;
