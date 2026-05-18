import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  Mail,
  MessageSquare,
  Save,
  UserRound
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getJobApplications, updateApplicationStatus, reset } from '../features/applications/applicationSlice';
import { getJob } from '../features/jobs/jobSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const PIPELINE_STATUSES = [
  { id: 'pending', label: 'Pending', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'shortlisted', label: 'Shortlisted', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'interview', label: 'Interview', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'offer', label: 'Offer', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'hired', label: 'Hired', badge: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'accepted', label: 'Accepted', badge: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'rejected', label: 'Rejected', badge: 'bg-rose-50 text-rose-700 border-rose-200' }
];

const getStatusConfig = (status) =>
  PIPELINE_STATUSES.find((item) => item.id === status) || PIPELINE_STATUSES[0];

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTimeLocal = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const createDraft = (application) => ({
  status: application.status || 'pending',
  employerNotes: application.employerNotes || '',
  interviewDate: formatDateTimeLocal(application.interviewDate),
  historyNote: ''
});

const JobApplicants = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { jobApplications, isLoading, isError, message } = useSelector((state) => state.applications);
  const { job } = useSelector((state) => state.jobs);

  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [drafts, setDrafts] = useState({});

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

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };

      jobApplications.forEach((application) => {
        if (!next[application._id]) {
          next[application._id] = createDraft(application);
        }
      });

      return next;
    });
  }, [jobApplications]);

  const statusCounts = useMemo(() => {
    const counts = { all: jobApplications.length };

    PIPELINE_STATUSES.forEach((status) => {
      counts[status.id] = jobApplications.filter((app) => app.status === status.id).length;
    });

    return counts;
  }, [jobApplications]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'all') {
      return jobApplications;
    }

    return jobApplications.filter((application) => application.status === statusFilter);
  }, [jobApplications, statusFilter]);

  const updateDraft = (applicationId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [applicationId]: {
        ...prev[applicationId],
        [field]: value
      }
    }));
  };

  const handleSavePipeline = async (application) => {
    const draft = drafts[application._id] || createDraft(application);

    setUpdatingId(application._id);
    try {
      const updated = await dispatch(updateApplicationStatus({
        id: application._id,
        status: draft.status,
        employerNotes: draft.employerNotes,
        interviewDate: draft.interviewDate,
        historyNote: draft.historyNote
      })).unwrap();

      setDrafts((prev) => ({
        ...prev,
        [application._id]: createDraft(updated)
      }));

      toast.success('Application pipeline updated');
    } catch (error) {
      toast.error(error || 'Failed to update application');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading && jobApplications.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate('/my-jobs')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Back to My Jobs
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {job ? job.title : 'Job Applicants'}
        </h1>
        {job && (
          <p className="mt-2 text-gray-600">
            {job.company} | {job.location}
          </p>
        )}
      </div>

      <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <UserRound className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <h2 className="font-semibold text-gray-900">Hiring Pipeline</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {[{ id: 'all', label: 'All' }, ...PIPELINE_STATUSES].map((status) => (
            <button
              key={status.id}
              type="button"
              onClick={() => setStatusFilter(status.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                statusFilter === status.id
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              {status.label} ({statusCounts[status.id] || 0})
            </button>
          ))}
        </div>
      </section>

      {filteredApplications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <FileText size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="mb-2 text-2xl font-semibold text-gray-800">
            {statusFilter === 'all' ? 'No applications yet' : `No ${statusFilter} applications`}
          </h2>
          <p className="text-gray-500">
            {statusFilter === 'all'
              ? 'Applications will appear here once jobseekers apply.'
              : 'Try another pipeline filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const statusConfig = getStatusConfig(application.status);
            const draft = drafts[application._id] || createDraft(application);
            const isUpdating = updatingId === application._id;

            return (
              <article key={application._id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {application.applicant?.name || 'Unknown Applicant'}
                        </h3>
                        <p className="mt-1 flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" aria-hidden="true" />
                          {application.applicant?.email}
                        </p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.badge}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>Applied on {formatDate(application.createdAt)}</span>
                      {application.interviewDate && (
                        <span className="flex items-center gap-1 font-medium text-purple-700">
                          <CalendarClock className="h-4 w-4" aria-hidden="true" />
                          Interview: {formatDate(application.interviewDate)}
                        </span>
                      )}
                      {application.applicant?.resume && (
                        <a
                          href={application.applicant.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
                        >
                          <FileText size={16} />
                          View Resume
                        </a>
                      )}
                    </div>

                    {application.employerNotes && (
                      <div className="mt-4 rounded-xl bg-gray-50 p-4">
                        <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <MessageSquare className="h-4 w-4" aria-hidden="true" />
                          Employer notes
                        </p>
                        <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                          {application.employerNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="grid gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Pipeline Stage
                        </label>
                        <select
                          value={draft.status}
                          onChange={(event) => updateDraft(application._id, 'status', event.target.value)}
                          className="input-field"
                        >
                          {PIPELINE_STATUSES.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Interview Date
                        </label>
                        <input
                          type="datetime-local"
                          value={draft.interviewDate}
                          onChange={(event) => updateDraft(application._id, 'interviewDate', event.target.value)}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Private Notes
                        </label>
                        <textarea
                          value={draft.employerNotes}
                          onChange={(event) => updateDraft(application._id, 'employerNotes', event.target.value)}
                          rows={4}
                          maxLength={2000}
                          className="input-field"
                          placeholder="Add screening notes, salary expectations, or follow-up context..."
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Update Note
                        </label>
                        <input
                          type="text"
                          value={draft.historyNote}
                          onChange={(event) => updateDraft(application._id, 'historyNote', event.target.value)}
                          maxLength={500}
                          className="input-field"
                          placeholder="Optional note for this stage change"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSavePipeline(application)}
                        disabled={isUpdating}
                        className="btn-primary w-full"
                      >
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {isUpdating ? 'Saving...' : 'Save Pipeline'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
