import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getApplications } from '../features/applications/applicationSlice';
import { Calendar, CalendarClock, CheckCircle2, Clock, DollarSign, FileText, MapPin, MessageCircle } from 'lucide-react';
import { formatSalaryRange } from '../utils/jobFormatters';
import { setDocumentMeta } from '../utils/documentMeta';

const STATUS_LABELS = {
  pending: 'Pending',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  accepted: 'Accepted',
  rejected: 'Rejected'
};

const PIPELINE_STAGES = ['pending', 'shortlisted', 'interview', 'offer', 'hired'];

const TERMINAL_STATUSES = ['accepted', 'rejected'];

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'Not set';

  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const getVisibleStages = (status) => {
  if (TERMINAL_STATUSES.includes(status)) {
    return [...PIPELINE_STAGES, status];
  }

  return PIPELINE_STAGES;
};

const getStageState = (stage, status) => {
  if (stage === status) return 'current';
  if (status === 'rejected') return 'inactive';

  const visibleStages = getVisibleStages(status);
  return visibleStages.indexOf(stage) < visibleStages.indexOf(status) ? 'complete' : 'inactive';
};

const getStatusColor = (status) => {
  switch (status) {
    case 'accepted':
    case 'offer':
    case 'hired':
      return 'bg-green-100 text-green-700';
    case 'shortlisted':
      return 'bg-blue-100 text-blue-700';
    case 'interview':
      return 'bg-purple-100 text-purple-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
};

function Applications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applications, isLoading } = useSelector((state) => state.applications);

  useEffect(() => {
    setDocumentMeta({
      title: 'My Applications | SkillMatch',
      description: 'Track your SkillMatch job applications, interview schedule, and hiring pipeline progress.'
    });
  }, []);

  useEffect(() => {
    dispatch(getApplications());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">Track your job applications</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : applications?.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-600">Start applying to jobs to see them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications?.map((app) => {
            const visibleStages = getVisibleStages(app.status);
            const latestHistory = [...(app.statusHistory || [])]
              .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))[0];

            return (
            <div key={app._id} className="card hover-lift">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {app.job?.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{app.job?.company}</p>
                  
                  {/* Job Type and Category Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {app.job?.jobType && (
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                        {app.job.jobType === 'full-time' && 'Full Time'}
                        {app.job.jobType === 'part-time' && 'Part Time'}
                        {app.job.jobType === 'remote' && 'Remote'}
                        {app.job.jobType === 'internship' && 'Internship'}
                        {app.job.jobType === 'contract' && 'Contract'}
                      </span>
                    )}
                    {app.job?.category && (
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        {app.job.category}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{app.job?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatSalaryRange(app.job)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Applied {formatDate(app.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">Application Progress</h4>
                      {latestHistory?.changedAt && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          Updated {formatDate(latestHistory.changedAt)}
                        </span>
                      )}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-5">
                      {visibleStages.map((stage) => {
                        const state = getStageState(stage, app.status);
                        const isComplete = state === 'complete';
                        const isCurrent = state === 'current';

                        return (
                          <div
                            key={stage}
                            className={`rounded-lg border px-3 py-2 text-sm ${
                              isCurrent
                                ? 'border-primary-300 bg-primary-50 text-primary-800'
                                : isComplete
                                  ? 'border-green-200 bg-green-50 text-green-800'
                                  : 'border-gray-200 bg-gray-50 text-gray-500'
                            }`}
                          >
                            <span className="flex items-center gap-2 font-medium">
                              <CheckCircle2
                                className={`h-4 w-4 ${isComplete || isCurrent ? 'text-green-600' : 'text-gray-300'}`}
                                aria-hidden="true"
                              />
                              {STATUS_LABELS[stage] || stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {app.interviewDate && (
                    <div className="mt-4 rounded-lg border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-900">
                      <p className="flex items-center gap-2 font-semibold">
                        <CalendarClock className="h-4 w-4" aria-hidden="true" />
                        Interview scheduled
                      </p>
                      <p className="mt-1 text-purple-800">{formatDateTime(app.interviewDate)}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-row items-center gap-2 lg:flex-col lg:items-end">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {STATUS_LABELS[app.status] || app.status}
                  </span>
                  <button
                    onClick={() => navigate(`/chat?application=${app._id}`)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Applications;
