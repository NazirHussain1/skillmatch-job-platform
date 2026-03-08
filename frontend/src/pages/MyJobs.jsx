import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEmployerJobs, createJob, updateJob, deleteJob, reset } from '../features/jobs/jobSlice';
import JobForm from '../components/JobForm';
import ConfirmDialog from '../components/ConfirmDialog';
import SkeletonLoader from '../components/SkeletonLoader';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'closed', label: 'Closed' }
];

const JOB_TYPE_LABELS = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  remote: 'Remote',
  internship: 'Internship',
  contract: 'Contract'
};

const normalizeStatus = (status = '') => status.toLowerCase();

const isClosedStatus = (status) => {
  const normalizedStatus = normalizeStatus(status);
  return normalizedStatus === 'closed' || normalizedStatus === 'rejected';
};

const matchesStatusFilter = (jobStatus, filterStatus) => {
  if (filterStatus === 'all') {
    return true;
  }

  if (filterStatus === 'closed') {
    return isClosedStatus(jobStatus);
  }

  return normalizeStatus(jobStatus) === filterStatus;
};

const formatStatusLabel = (status) => {
  const normalizedStatus = normalizeStatus(status);
  if (!normalizedStatus) {
    return 'Unknown';
  }

  if (normalizedStatus === 'rejected') {
    return 'Rejected';
  }

  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
};

const getStatusBadgeStyles = (status) => {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === 'active') {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }

  if (normalizedStatus === 'pending') {
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  }

  if (normalizedStatus === 'closed') {
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  }

  if (normalizedStatus === 'rejected') {
    return 'bg-rose-50 text-rose-700 border border-rose-200';
  }

  return 'bg-slate-100 text-slate-700 border border-slate-200';
};

const JobsHeader = ({ onCreate }) => (
  <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
      <p className="mt-1 text-sm text-gray-600">
        Manage your job listings and review applicants in one place.
      </p>
    </div>
    <button
      type="button"
      onClick={onCreate}
      aria-label="Create a new job posting"
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <Plus size={18} />
      Create Job
    </button>
  </div>
);

const JobsFilterBar = ({ statusFilter, onChange, total, counts }) => (
  <section
    className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4"
    aria-label="Job status filters"
  >
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-gray-900">Filters</p>
      <p className="text-xs text-gray-500">
        Showing <span className="font-semibold text-blue-600">{counts[statusFilter] ?? 0}</span> of{' '}
        <span className="font-semibold text-blue-600">{total}</span> jobs
      </p>
    </div>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Select job status">
      {STATUS_FILTERS.map((filter) => {
        const isActiveFilter = statusFilter === filter.id;
        const count = counts[filter.id] ?? 0;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            aria-label={`Show ${filter.label.toLowerCase()} jobs`}
            aria-pressed={isActiveFilter}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              isActiveFilter
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            <span>{filter.label}</span>
            <span className={`text-[11px] ${isActiveFilter ? 'text-blue-100' : 'text-gray-500'}`}>
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  </section>
);

const EmptyJobsState = ({ title, description, actionLabel, onAction }) => (
  <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-sm">
    <div className="mb-4 flex justify-center text-gray-300">
      <Users size={64} />
    </div>
    <h2 className="mb-2 text-2xl font-semibold text-gray-800">{title}</h2>
    <p className="mx-auto mb-6 max-w-md text-gray-500">{description}</p>
    {onAction && (
      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <Plus size={18} />
        {actionLabel}
      </button>
    )}
  </div>
);

const JobCard = ({ job, onViewApplicants, onEdit, onDelete, formatDate, formatSalary }) => (
  <article className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-white">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
          {job.title}
        </h3>
        <p className="mt-1 truncate text-sm font-medium text-gray-600">{job.company}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeStyles(job.status)}`}
        >
          {formatStatusLabel(job.status)}
        </span>
        <span className="inline-flex items-center whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {job.applicationCount || 0} applicants
        </span>
      </div>
    </div>

    <div className="mb-3 flex flex-wrap gap-2">
      {job.jobType && (
        <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-[11px] font-medium capitalize text-primary-700">
          {JOB_TYPE_LABELS[job.jobType] || job.jobType}
        </span>
      )}
      {job.category && (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
          {job.category}
        </span>
      )}
    </div>

    <div className="mb-4 space-y-1">
      <p className="truncate text-sm text-gray-600">{job.location}</p>
      <p className="text-sm font-semibold text-green-600">
        {formatSalary(job.salary)}
        <span className="text-xs font-normal text-gray-500"> / year</span>
      </p>
      <p className="text-xs text-gray-400">Posted on {formatDate(job.createdAt)}</p>
    </div>

    <div className="mt-auto flex items-center gap-2 border-t pt-4">
      <button
        type="button"
        onClick={onViewApplicants}
        aria-label={`View applicants for ${job.title}`}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs font-medium text-gray-800 transition-colors duration-200 hover:bg-gray-100 sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <Users size={16} />
        View applicants
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center justify-center rounded-xl bg-blue-50 px-3 py-2 text-blue-700 transition-colors duration-200 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        aria-label={`Edit job ${job.title}`}
      >
        <Edit size={16} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center justify-center rounded-xl bg-red-50 px-3 py-2 text-red-700 transition-colors duration-200 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
    <div className="fixed inset-0 z-[80] overflow-y-auto p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
        aria-hidden="true"
      />
      <div className="relative flex min-h-full items-start justify-center sm:items-center">
        <div
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalId}
          aria-busy={isSubmitting}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 id={modalId} className="text-2xl font-bold text-gray-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={() => !isSubmitting && onClose()}
              className="rounded-full p-1.5 text-gray-400 transition-colors duration-200 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Close job modal"
            >
              <X size={18} aria-hidden="true" />
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
    </div>
  );
};

const MyJobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employerJobs, isLoading, isError, message } = useSelector((state) => state.jobs);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const isAnyOverlayOpen = showCreateModal || showEditModal || showDeleteDialog;

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
    if (!selectedJob?._id) {
      return;
    }

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
    if (!selectedJob?._id) {
      return;
    }

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

  const allJobs = Array.isArray(employerJobs) ? employerJobs : [];

  const statusCounts = useMemo(() => {
    const counts = {
      all: allJobs.length,
      active: 0,
      pending: 0,
      closed: 0
    };

    allJobs.forEach((job) => {
      if (matchesStatusFilter(job.status, 'active')) {
        counts.active += 1;
      } else if (matchesStatusFilter(job.status, 'pending')) {
        counts.pending += 1;
      } else if (matchesStatusFilter(job.status, 'closed')) {
        counts.closed += 1;
      }
    });

    return counts;
  }, [allJobs]);

  const filteredJobs = useMemo(
    () => allJobs.filter((job) => matchesStatusFilter(job.status, statusFilter)),
    [allJobs, statusFilter]
  );

  if (isLoading && allJobs.length === 0) {
    return (
      <div className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <JobsHeader onCreate={() => setShowCreateModal(true)} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
            <SkeletonLoader type="card" count={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JobsHeader onCreate={() => setShowCreateModal(true)} />

      {allJobs.length > 0 && (
        <JobsFilterBar
          statusFilter={statusFilter}
          onChange={setStatusFilter}
          total={allJobs.length}
          counts={statusCounts}
        />
      )}

      {allJobs.length === 0 ? (
        <EmptyJobsState
          title="No jobs posted yet"
          description="Start by creating your first job posting to attract qualified candidates."
          actionLabel="Create your first job"
          onAction={() => setShowCreateModal(true)}
        />
      ) : filteredJobs.length === 0 ? (
        <EmptyJobsState
          title="No jobs match this filter"
          description="Try another status filter to review your jobs."
          actionLabel="Show all jobs"
          onAction={() => setStatusFilter('all')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

