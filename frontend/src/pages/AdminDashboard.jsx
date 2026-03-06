import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAnalytics } from '../features/admin/adminSlice';
import { Users, Briefcase, FileText, TrendingUp, Building2, UserCheck, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import adminService from '../services/adminService';
import SkeletonLoader from '../components/SkeletonLoader';

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { analytics, isLoading } = useSelector((state) => state.admin);
  const [jobStats, setJobStats] = useState(null);

  useEffect(() => {
    dispatch(getAnalytics());
    fetchJobStats();
  }, [dispatch]);

  const fetchJobStats = async () => {
    try {
      const [pending, active, rejected, closed] = await Promise.all([
        adminService.getJobsByStatus('pending', { limit: 1 }),
        adminService.getJobsByStatus('active', { limit: 1 }),
        adminService.getJobsByStatus('rejected', { limit: 1 }),
        adminService.getJobsByStatus('closed', { limit: 1 })
      ]);
      
      setJobStats({
        pending: pending.pagination.total,
        active: active.pagination.total,
        rejected: rejected.pagination.total,
        closed: closed.pagination.total
      });
    } catch (error) {
      console.error('Failed to fetch job stats:', error);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform analytics and insights</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader type="stat" count={6} />
        </div>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => navigate('/admin/users')}
          className="glass rounded-2xl p-6 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Manage Users</h3>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">View, edit, and manage all platform users and their roles</p>
        </div>

        <div 
          onClick={() => navigate('/admin/jobs')}
          className="glass rounded-2xl p-6 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Manage Jobs</h3>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Moderate job postings, approve or reject submissions</p>
        </div>
      </div>

      {/* Job Status Breakdown */}
      {jobStats && (
        <div className="glass rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Job Status Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              onClick={() => navigate('/admin/jobs')}
              className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800 text-sm font-medium">Pending</p>
              </div>
              <p className="text-3xl font-bold text-yellow-900">{jobStats.pending}</p>
              <p className="text-xs text-yellow-700 mt-1">Awaiting review</p>
            </div>
            <div 
              onClick={() => navigate('/admin/jobs')}
              className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 text-sm font-medium">Active</p>
              </div>
              <p className="text-3xl font-bold text-green-900">{jobStats.active}</p>
              <p className="text-xs text-green-700 mt-1">Currently live</p>
            </div>
            <div 
              onClick={() => navigate('/admin/jobs')}
              className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 text-sm font-medium">Rejected</p>
              </div>
              <p className="text-3xl font-bold text-red-900">{jobStats.rejected}</p>
              <p className="text-xs text-red-700 mt-1">Not approved</p>
            </div>
            <div 
              onClick={() => navigate('/admin/jobs')}
              className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl cursor-pointer hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-gray-600" />
                <p className="text-gray-800 text-sm font-medium">Closed</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{jobStats.closed}</p>
              <p className="text-xs text-gray-700 mt-1">No longer active</p>
            </div>
          </div>
        </div>
      )}

      {/* Application Status */}
      <div className="glass rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Application Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 text-sm font-medium">Pending</p>
            </div>
            <p className="text-3xl font-bold text-yellow-900">{applications.pending}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 text-sm font-medium">Accepted</p>
            </div>
            <p className="text-3xl font-bold text-green-900">{applications.accepted}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm font-medium">Rejected</p>
            </div>
            <p className="text-3xl font-bold text-red-900">{applications.rejected}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity (Last 30 Days)</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium">New Users</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{recentActivity.newUsersLast30Days}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">New Jobs Posted</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">{recentActivity.newJobsLast30Days}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">New Applications</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{recentActivity.newApplicationsLast30Days}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Employers */}
        <div className="glass rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Employers</h2>
          <div className="space-y-3">
            {topEmployers.map((employer, index) => (
              <div key={employer._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{employer.companyName || employer.name}</p>
                    <p className="text-sm text-gray-600">{employer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{employer.jobCount}</span>
                  <p className="text-xs text-gray-500">jobs</p>
                </div>
              </div>
            ))}
            {topEmployers.length === 0 && (
              <p className="text-gray-600 text-center py-8">No employers yet</p>
            )}
          </div>
        </div>

        {/* Jobs by Salary Range */}
        <div className="glass rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Jobs by Salary Range</h2>
          <div className="space-y-3">
            {jobsBySalary.map((range) => (
              <div key={range._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl hover:shadow-md transition-all">
                <span className="text-gray-700 font-medium">{salaryRanges[range._id] || 'Other'}</span>
                <div className="text-right">
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{range.count}</span>
                  <p className="text-xs text-gray-500">jobs</p>
                </div>
              </div>
            ))}
            {jobsBySalary.length === 0 && (
              <p className="text-gray-600 text-center py-8">No jobs yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
