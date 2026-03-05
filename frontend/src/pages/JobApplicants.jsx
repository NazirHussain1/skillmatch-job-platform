import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getJobApplications, updateApplicationStatus } from '../features/applications/applicationSlice';
import { getJob } from '../features/jobs/jobSlice';
import { ArrowLeft, Mail, User, Calendar, CheckCircle, XCircle, Clock, MessageCircle } from 'lucide-react';

function JobApplicants() {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applications, isLoading } = useSelector((state) => state.applications);
  const { job } = useSelector((state) => state.jobs);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(getJob(jobId));
    dispatch(getJobApplications(jobId));
  }, [dispatch, jobId]);

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      await dispatch(updateApplicationStatus({ id: applicationId, status })).unwrap();
      toast.success(`Application ${status}!`);
    } catch (error) {
      toast.error(error || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800',
        label: 'Pending'
      },
      accepted: {
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800',
        label: 'Accepted'
      },
      rejected: {
        icon: XCircle,
        className: 'bg-red-100 text-red-800',
        label: 'Rejected'
      }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${badge.className}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/my-jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Jobs
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">{job?.title}</h1>
        <p className="text-gray-600 mt-1">{job?.company} • {job?.location}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm">Total Applications</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Accepted</p>
          <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Rejected</p>
          <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'pending'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'accepted'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Accepted ({stats.accepted})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'rejected'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={application._id} className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.applicant?.name}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="flex flex-col gap-2 text-sm text-gray-600 ml-8">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <a 
                        href={`mailto:${application.applicant?.email}`}
                        className="hover:text-primary-600"
                      >
                        {application.applicant?.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Applied on {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {application.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(application._id, 'accepted')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(application._id, 'rejected')}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => navigate(`/chat?application=${application._id}`)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Applications will appear here when jobseekers apply to this job'
              : `No applications with ${filter} status`
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default JobApplicants;
