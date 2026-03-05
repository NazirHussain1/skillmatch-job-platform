import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAnalytics } from '../features/admin/adminSlice';
import { Users, Briefcase, FileText, TrendingUp, Building2, UserCheck } from 'lucide-react';

function AdminDashboard() {
  const dispatch = useDispatch();
  const { analytics, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAnalytics());
  }, [dispatch]);

  if (isLoading || !analytics) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { overview, applications, recentActivity, topEmployers, jobsBySalary } = analytics;

  const salaryRanges = {
    0: '$0-$30k',
    30000: '$30k-$50k',
    50000: '$50k-$70k',
    70000: '$70k-$100k',
    100000: '$100k-$150k',
    150000: '$150k+'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform analytics and insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{overview.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Employers</p>
              <p className="text-3xl font-bold text-gray-900">{overview.totalEmployers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Jobseekers</p>
              <p className="text-3xl font-bold text-gray-900">{overview.totalJobseekers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900">{overview.totalJobs}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{overview.totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">New Users (30d)</p>
              <p className="text-3xl font-bold text-gray-900">{recentActivity.newUsersLast30Days}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Application Status */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Application Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800 text-sm font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">{applications.pending}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 text-sm font-medium">Accepted</p>
            <p className="text-2xl font-bold text-green-900">{applications.accepted}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-red-800 text-sm font-medium">Rejected</p>
            <p className="text-2xl font-bold text-red-900">{applications.rejected}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity (Last 30 Days)</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">New Users</span>
            <span className="font-bold text-gray-900">{recentActivity.newUsersLast30Days}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">New Jobs Posted</span>
            <span className="font-bold text-gray-900">{recentActivity.newJobsLast30Days}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">New Applications</span>
            <span className="font-bold text-gray-900">{recentActivity.newApplicationsLast30Days}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Employers */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Employers</h2>
          <div className="space-y-3">
            {topEmployers.map((employer, index) => (
              <div key={employer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{employer.companyName || employer.name}</p>
                    <p className="text-sm text-gray-600">{employer.email}</p>
                  </div>
                </div>
                <span className="font-bold text-primary-600">{employer.jobCount} jobs</span>
              </div>
            ))}
            {topEmployers.length === 0 && (
              <p className="text-gray-600 text-center py-4">No employers yet</p>
            )}
          </div>
        </div>

        {/* Jobs by Salary Range */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Jobs by Salary Range</h2>
          <div className="space-y-3">
            {jobsBySalary.map((range) => (
              <div key={range._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{salaryRanges[range._id] || 'Other'}</span>
                <span className="font-bold text-gray-900">{range.count} jobs</span>
              </div>
            ))}
            {jobsBySalary.length === 0 && (
              <p className="text-gray-600 text-center py-4">No jobs yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
