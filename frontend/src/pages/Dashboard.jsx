import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getJobs } from '../features/jobs/jobSlice';
import { getApplications } from '../features/applications/applicationSlice';
import { Briefcase, FileText, TrendingUp, Plus } from 'lucide-react';

function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { jobs } = useSelector((state) => state.jobs);
  const { applications } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(getJobs());
    dispatch(getApplications());
  }, [dispatch]);

  const stats = [
    {
      label: 'Total Jobs',
      value: jobs?.length || 0,
      icon: Briefcase,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Applications',
      value: applications?.length || 0,
      icon: FileText,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Pending',
      value: applications?.filter((app) => app.status === 'pending').length || 0,
      icon: TrendingUp,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'employer' ? 'Manage your job postings' : 'Track your job applications'}
          </p>
        </div>
        {user?.role === 'employer' && (
          <Link to="/jobs" className="btn-primary">
            <Plus className="w-5 h-5" />
            Post Job
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
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
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
}

export default Dashboard;
