import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CalendarDays,
  DollarSign,
  ExternalLink,
  MapPin,
  Send
} from 'lucide-react';
import { getJob } from '../features/jobs/jobSlice';
import { createApplication } from '../features/applications/applicationSlice';
import { saveJob, unsaveJob } from '../features/user/userSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  EXPERIENCE_LEVEL_LABELS,
  WORKPLACE_TYPE_LABELS,
  formatDeadline,
  formatSalaryRange
} from '../utils/jobFormatters';

const formatJobType = (jobType) => {
  const labels = {
    'full-time': 'Full Time',
    'part-time': 'Part Time',
    remote: 'Remote',
    internship: 'Internship',
    contract: 'Contract'
  };

  return labels[jobType] || jobType;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Recently posted';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateString));
};

function JobDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { job, isLoading, isError, message } = useSelector((state) => state.jobs);
  const { profile } = useSelector((state) => state.user);
  const isSaved = Boolean(profile?.savedJobs?.includes(id));

  useEffect(() => {
    dispatch(getJob(id));
  }, [dispatch, id]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = job?.title ? `${job.title} | SkillMatch` : 'Job Details | SkillMatch';

    return () => {
      document.title = previousTitle;
    };
  }, [job?.title]);

  const handleApply = async () => {
    try {
      await dispatch(createApplication(id)).unwrap();
      toast.success('Application submitted');
    } catch (error) {
      toast.error(error || 'Failed to apply');
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await dispatch(unsaveJob(id)).unwrap();
        toast.success('Job removed from saved');
      } else {
        await dispatch(saveJob(id)).unwrap();
        toast.success('Job saved');
      }
    } catch (error) {
      toast.error(error || 'Failed to save job');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {!user && (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="container-custom">
            <nav className="flex h-16 items-center justify-between">
              <Link to="/" className="flex items-center gap-2" aria-label="Go to home">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold text-blue-700">SkillMatch</span>
              </Link>
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        </header>
      )}

      <main className={user ? '' : 'container-custom py-6 sm:py-8'}>
        <Link
          to="/jobs"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to jobs
        </Link>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="large" />
          </div>
        ) : isError || !job ? (
          <EmptyState
            type="search"
            title="Job not available"
            description={message || 'This job may have been closed or removed.'}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <Building2 className="h-7 w-7 text-blue-700" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                      {job.title}
                    </h1>
                    <p className="mt-2 text-lg font-medium text-gray-700">{job.company}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="badge-primary capitalize">{formatJobType(job.jobType)}</span>
                      {job.workplaceType && (
                        <span className="badge-primary">
                          {WORKPLACE_TYPE_LABELS[job.workplaceType] || job.workplaceType}
                        </span>
                      )}
                      {job.experienceLevel && (
                        <span className="badge-secondary">
                          {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
                        </span>
                      )}
                      {job.isUrgent && <span className="badge-danger">Urgent hiring</span>}
                      <span className="badge-secondary">{job.category}</span>
                      <span className={job.status === 'active' ? 'badge-success' : 'badge-warning'}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-4">
                  <MapPin className="mb-2 h-5 w-5 text-blue-700" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase text-gray-500">Location</p>
                  <p className="mt-1 font-semibold text-gray-900">{job.location}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <DollarSign className="mb-2 h-5 w-5 text-green-700" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase text-gray-500">Salary</p>
                  <p className="mt-1 font-semibold text-gray-900">{formatSalaryRange(job)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <CalendarDays className="mb-2 h-5 w-5 text-purple-700" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase text-gray-500">Posted</p>
                  <p className="mt-1 font-semibold text-gray-900">{formatDate(job.createdAt)}</p>
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-bold text-gray-900">Job Description</h2>
                <div className="whitespace-pre-line leading-7 text-gray-700">
                  {job.description}
                </div>
              </div>

              {Array.isArray(job.skills) && job.skills.length > 0 && (
                <div className="mt-8">
                  <h2 className="mb-3 text-xl font-bold text-gray-900">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(job.benefits) && job.benefits.length > 0 && (
                <div className="mt-8">
                  <h2 className="mb-3 text-xl font-bold text-gray-900">Benefits</h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {job.benefits.map((benefit) => (
                      <span key={benefit} className="rounded-xl bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">Apply for this role</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Keep your profile and resume updated before applying.
                </p>
                <p className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                  Apply by: {formatDeadline(job.applicationDeadline)}
                </p>

                <div className="mt-5 space-y-3">
                  {!user ? (
                    <>
                      <Link to="/login" className="btn-primary w-full">
                        <Send className="h-5 w-5" aria-hidden="true" />
                        Login to Apply
                      </Link>
                      <Link to="/register" className="btn-secondary w-full">
                        Create Account
                      </Link>
                    </>
                  ) : user.role === 'jobseeker' ? (
                    <>
                      <button type="button" onClick={handleApply} className="btn-primary w-full">
                        <Send className="h-5 w-5" aria-hidden="true" />
                        Apply Now
                      </button>
                      <button type="button" onClick={handleSave} className="btn-secondary w-full">
                        {isSaved ? (
                          <BookmarkCheck className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <Bookmark className="h-5 w-5" aria-hidden="true" />
                        )}
                        {isSaved ? 'Saved' : 'Save Job'}
                      </button>
                    </>
                  ) : (
                    <Link to="/jobs" className="btn-secondary w-full">
                      Browse Jobs
                    </Link>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">Company</h2>
                <p className="mt-2 font-semibold text-gray-800">{job.company}</p>
                {job.employer?.name && (
                  <p className="mt-1 text-sm text-gray-600">Posted by {job.employer.name}</p>
                )}
                {job.employer?._id && (
                  <Link
                    to={`/companies/${job.employer._id}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                  >
                    View company profile
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default JobDetails;
