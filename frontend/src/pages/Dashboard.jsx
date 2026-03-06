import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getJobs } from '../features/jobs/jobSlice';
import { getApplications } from '../features/applications/applicationSlice';
import { Briefcase, FileText, TrendingUp, Plus, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import api from '../services/api';

function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { jobs } = useSelector((state) => state.jobs);
  const { applications } = useSelector((state) => state.applications);
  const [employerStats, setEmployerStats] = useState(null);

  useEffect(() => {
    if (user?.role === 'employer') {
      api.get('/jobs/stats').then(response => {
        setEmployerStats(response.data.data);
      }).catch(() => {
        setEmployerStats(null);
      });
    } else {
      dispatch(getJobs({ limit: 10 }));
      dispatch(getApplications());
    }
  }, [dispatch, user]);

  // Jobseeker stats
  const jobseekerStats = [
    {
      label: 'Total Applications',
      value: applications?.length || 0,
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Pending',
      value: applications?.filter((app) => app.status === 'pending').length || 0,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'Accepted',
      value: applications?.filter((app) => app.status === 'accepted').length || 0,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Rejected',
      value: applications?.filter((app) => app.status === 'rejected').length || 0,
      icon: XCircle,
      color: 'bg-red-100 text-red-600',
    },
  ];

  // Employer stats
  const employerStatsCards = employerStats ? [
    {
      label: 'Total Jobs',
      value: employerStats.jobs.total,
      icon: Briefcase,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Active Jobs',
      value: employerStats.jobs.active,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Total Applications',
      value: employerStats.applications.total,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Pending Applications',
      value: employerStats.applications.pending,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'employer' ? 'Manage your job postings and applications' : 'Track your job applications'}
          </p>
        </div>
        {user?.role === 'employer' && (
          <Link to="/jobs" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Post Job
          </Link>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'employer' ? (
          employerStatsCards.map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))
        ) : (
          jobseekerStats.map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Employer Additional Stats */}
      {user?.role === 'employer' && employerStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active</span>
                <span className="font-semibold text-green-600">{employerStats.jobs.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Closed</span>
                <span className="font-semibold text-gray-600">{employerStats.jobs.closed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Review</span>
                <span className="font-semibold text-yellow-600">{employerStats.jobs.pending}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">{employerStats.applications.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Accepted</span>
                <span className="font-semibold text-green-600">{employerStats.applications.accepted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rejected</span>
                <span className="font-semibold text-red-600">{employerStats.applications.rejected}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Applications (30d)</span>
                <span className="font-semibold text-primary-600">{employerStats.applications.recent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Jobs</span>
                <span className="font-semibold text-primary-600">{employerStats.jobs.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {user?.role === 'employer' ? (
          <>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                <Link to="/my-jobs" className="block p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-primary-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Manage Jobs</h3>
                      <p className="text-sm text-gray-600">View and edit your job postings</p>
                    </div>
                  </div>
                </Link>
                <Link to="/jobs" className="block p-4 bg-green-50 rounded-xl hover:bg-green-100 transition">
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Post New Job</h3>
                      <p className="text-sm text-gray-600">Create a new job listing</p>
                    </div>
                  </div>
                </Link>
                <Link to="/chat" className="block p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Messages</h3>
                      <p className="text-sm text-gray-600">Chat with applicants</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
              <div className="space-y-3">
                {jobs?.slice(0, 5).map((job) => (
                  <Link
                    key={job._id}
                    to="/jobs"
                    className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <p className="text-sm text-gray-500 mt-1">{job.location}</p>
                  </Link>
                ))}
                {jobs?.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No jobs available</p>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
              <div className="space-y-3">
                {applications?.slice(0, 5).map((app) => (
                  <Link
                    key={app._id}
                    to="/applications"
                    className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <h3 className="font-semibold text-gray-900">{app.job?.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">{app.job?.company}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </Link>
                ))}
                {applications?.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No applications yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
