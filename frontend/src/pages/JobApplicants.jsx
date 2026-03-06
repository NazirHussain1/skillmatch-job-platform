import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getJobApplications, updateApplicationStatus, reset } from '../features/applications/applicationSlice';
import { getJob } from '../features/jobs/jobSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const JobApplicants = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { jobApplications, isLoading, isError, message } = useSelector(state => state.applications);
  const { job } = useSelector(state => state.jobs);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(getJob(jobId));
    dispatch(getJobApplications(jobId));
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch, jobId]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  const handleUpdateStatus = async (applicationId, status) => {
    setUpdatingId(applicationId);
    try {
      await dispatch(updateApplicationStatus({ id: applicationId, status })).unwrap();
      toast.success(`Application ${status}`);
    } catch (error) {
      toast.error(error || 'Failed to update application status');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredApplications = jobApplications.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusCounts = {
    all: jobApplications.length,
    pending: jobApplications.filter(app => app.status === 'pending').length,
    accepted: jobApplications.filter(app => app.status === 'accepted').length,
    rejected: jobApplications.filter(app => app.status === 'rejected').length
  };

  if (isLoading && jobApplications.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/my-jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to My Jobs
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {job ? job.title : 'Job Applicants'}
        </h1>
        {job && (
          <div className="mt-2">
            <p className="text-gray-600">
              {job.company} • {job.location}
            </p>
            {/* Job Type Badge */}
            {job.jobType && (
              <div className="mt-2">
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                  {job.jobType === 'full-time' && 'Full Time'}
                  {job.jobType === 'part-time' && 'Part Time'}
                  {job.jobType === 'remote' && 'Remote'}
                  {job.jobType === 'internship' && 'Internship'}
                  {job.jobType === 'contract' && 'Contract'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['all', 'pending', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <FileText size={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            {statusFilter === 'all' 
              ? 'No applications yet' 
              : `No ${statusFilter} applications`}
          </h2>
          <p className="text-gray-500">
            {statusFilter === 'all'
              ? 'Applications will appear here once jobseekers apply'
              : `Try selecting a different status filter`}
          </p>
        </div>
      ) : (
        /* Applicants List */
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={application._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.jobseeker?.name || 'Unknown Applicant'}
                      </h3>
                      <p className="text-gray-600">{application.jobseeker?.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mt-3">
                    <span>Applied on {formatDate(application.createdAt)}</span>
                    {application.jobseeker?.resume && (
                      <a
                        href={application.jobseeker.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <FileText size={16} />
                        View Resume
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {application.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(application._id, 'accepted')}
                      disabled={updatingId === application._id}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={16} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(application._id, 'rejected')}
                      disabled={updatingId === application._id}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
