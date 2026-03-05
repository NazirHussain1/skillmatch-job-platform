import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEmployerJobs, createJob, updateJob, deleteJob, reset } from '../features/jobs/jobSlice';
import JobForm from '../components/JobForm';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';

const MyJobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employerJobs, isLoading, isError, isSuccess, message } = useSelector(state => state.jobs);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreateJob = async (jobData) => {
    setIsSubmitting(true);
    try {
      const result = await dispatch(createJob(jobData)).unwrap();
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

  if (isLoading && employerJobs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Job
        </button>
      </div>

      {/* Empty State */}
      {employerJobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Users size={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No jobs posted yet</h2>
          <p className="text-gray-500 mb-6">Start by creating your first job posting</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Your First Job
          </button>
        </div>
      ) : (
        /* Jobs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employerJobs.map((job) => (
            <div key={job._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {job.applicationCount || 0} applicants
                </span>
              </div>
              
              <p className="text-gray-600 font-medium mb-2">{job.company}</p>
              <p className="text-gray-500 text-sm mb-2">{job.location}</p>
              <p className="text-green-600 font-semibold mb-2">{formatSalary(job.salary)}/year</p>
              <p className="text-gray-400 text-xs mb-4">Posted on {formatDate(job.createdAt)}</p>
              
              <div className="border-t pt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/job-applicants/${job._id}`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Users size={16} />
                  View Applicants
                </button>
                <button
                  onClick={() => openEditModal(job)}
                  className="flex items-center justify-center bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => openDeleteDialog(job)}
                  className="flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => !isSubmitting && setShowCreateModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Job</h2>
            <JobForm
              onSubmit={handleCreateJob}
              onCancel={() => setShowCreateModal(false)}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => !isSubmitting && setShowEditModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h2>
            <JobForm
              initialData={selectedJob}
              onSubmit={handleEditJob}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedJob(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

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
