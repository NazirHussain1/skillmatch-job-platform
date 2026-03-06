import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Users,
  Briefcase,
  FileText,
  Filter,
  User,
  Mail,
  Calendar,
  Shield,
  Trash2,
  Building2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import adminService from '../services/adminService';
import ConfirmDialog from '../components/ConfirmDialog';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const usersPerPage = 10;
const jobsPerPage = 10;

const roleFilters = ['all', 'admin', 'employer', 'jobseeker'];
const statusFilters = ['all', 'pending', 'active', 'rejected', 'closed'];

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    pages: 0,
    total: 0
  });
  const [jobsPagination, setJobsPagination] = useState({
    page: 1,
    pages: 0,
    total: 0
  });

  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [usersPage, setUsersPage] = useState(1);
  const [jobsPage, setJobsPage] = useState(1);

  const [deleteUserDialog, setDeleteUserDialog] = useState({
    isOpen: false,
    userId: null,
    userName: ''
  });
  const [deleteJobDialog, setDeleteJobDialog] = useState({
    isOpen: false,
    jobId: null,
    jobTitle: ''
  });
  const [roleDialog, setRoleDialog] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    currentRole: '',
    newRole: ''
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchUsers(roleFilter, usersPage);
  }, [roleFilter, usersPage]);

  useEffect(() => {
    fetchJobs(statusFilter, jobsPage);
  }, [statusFilter, jobsPage]);

  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchUsers = async (role = 'all', page = 1) => {
    try {
      setIsLoadingUsers(true);
      const filters = { page, limit: usersPerPage };
      if (role !== 'all') {
        filters.role = role;
      }

      const data = await adminService.getAllUsers(filters);
      setUsers(data.users);
      setUsersPagination(data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchJobs = async (status = 'all', page = 1) => {
    try {
      setIsLoadingJobs(true);
      const filters = { page, limit: jobsPerPage };
      if (status !== 'all') {
        filters.status = status;
      }

      const data = await adminService.getAllJobs(filters);
      setJobs(data.jobs);
      setJobsPagination(data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleDeleteUser = async () => {
    const { userId } = deleteUserDialog;
    if (!userId) return;

    try {
      setActionLoading(`delete-user-${userId}`);
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      setDeleteUserDialog({ isOpen: false, userId: null, userName: '' });
      await Promise.all([
        fetchUsers(roleFilter, usersPage),
        fetchAnalytics()
      ]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async () => {
    const { jobId } = deleteJobDialog;
    if (!jobId) return;

    try {
      setActionLoading(`delete-job-${jobId}`);
      await adminService.deleteJob(jobId);
      toast.success('Job deleted successfully');
      setDeleteJobDialog({ isOpen: false, jobId: null, jobTitle: '' });
      await Promise.all([
        fetchJobs(statusFilter, jobsPage),
        fetchAnalytics()
      ]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleUpdate = async () => {
    if (!roleDialog.userId || !roleDialog.newRole) return;

    try {
      setActionLoading(`role-${roleDialog.userId}`);
      const updatedUser = await adminService.updateUserRole(roleDialog.userId, roleDialog.newRole);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        )
      );
      toast.success('User role updated successfully');
      setRoleDialog({
        isOpen: false,
        userId: null,
        userName: '',
        currentRole: '',
        newRole: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      setActionLoading(`approve-${jobId}`);
      await adminService.approveJob(jobId);
      toast.success('Job approved successfully');
      await Promise.all([
        fetchJobs(statusFilter, jobsPage),
        fetchAnalytics()
      ]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      setActionLoading(`reject-${jobId}`);
      await adminService.rejectJob(jobId);
      toast.success('Job rejected successfully');
      await Promise.all([
        fetchJobs(statusFilter, jobsPage),
        fetchAnalytics()
      ]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject job');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge-danger',
      employer: 'badge-primary',
      jobseeker: 'badge-success'
    };
    return badges[role] || 'badge-secondary';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Admin',
      employer: 'Employer',
      jobseeker: 'Job Seeker'
    };
    return labels[role] || role;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      pending: 'badge-warning',
      rejected: 'badge-danger',
      closed: 'badge-secondary'
    };
    return badges[status] || 'badge-secondary';
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderPagination = (pagination, onPageChange) => {
    if (!pagination || pagination.pages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.pages}
        </span>
        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.pages}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage users, jobs, and moderation workflows</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoadingAnalytics ? (
          <SkeletonLoader type="stat" count={3} />
        ) : (
          <>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics?.overview?.totalUsers ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Jobs</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics?.overview?.totalJobs ?? 0}</p>
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
                  <p className="text-3xl font-bold text-gray-900">{analytics?.overview?.totalApplications ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="glass rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Users</h2>
              <div className="text-sm text-gray-500">{usersPagination.total} total</div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter by role</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {roleFilters.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setRoleFilter(role);
                    setUsersPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    roleFilter === role
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {role === 'all' ? 'All Users' : getRoleLabel(role)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoadingUsers ? (
          <div className="p-6">
            <SkeletonLoader type="list" count={8} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-6">
            <EmptyState
              type="inbox"
              title="No users found"
              description={`No ${roleFilter === 'all' ? '' : roleFilter} users to display`}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{user.name}</div>
                            {user.companyName && (
                              <div className="text-sm text-gray-500">{user.companyName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${getRoleBadge(user.role)}`}>{getRoleLabel(user.role)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setRoleDialog({
                                isOpen: true,
                                userId: user._id,
                                userName: user.name,
                                currentRole: user.role,
                                newRole: user.role
                              })
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Change Role"
                          >
                            <Shield className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteUserDialog({
                                isOpen: true,
                                userId: user._id,
                                userName: user.name
                              })
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(usersPagination, setUsersPage)}
          </>
        )}
      </div>

      <div className="glass rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Jobs</h2>
              <div className="text-sm text-gray-500">{jobsPagination.total} total</div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter by status</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setJobsPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {status === 'all' ? 'All Jobs' : getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoadingJobs ? (
          <div className="p-6">
            <SkeletonLoader type="list" count={8} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              type="jobs"
              title="No jobs found"
              description={`No ${statusFilter === 'all' ? '' : statusFilter} jobs to display`}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Job</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Posted</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{job.title}</div>
                        {job.category && (
                          <div className="text-sm text-gray-500">{job.category}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Building2 className="w-4 h-4" />
                          <span className="text-sm">{job.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {job.employer?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${getStatusBadge(job.status)}`}>{getStatusLabel(job.status)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(job.status === 'pending' || job.status === 'rejected' || job.status === 'closed') && (
                            <button
                              onClick={() => handleApproveJob(job._id)}
                              disabled={actionLoading === `approve-${job._id}`}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve Job"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          {(job.status === 'pending' || job.status === 'active') && (
                            <button
                              onClick={() => handleRejectJob(job._id)}
                              disabled={actionLoading === `reject-${job._id}`}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject Job"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setDeleteJobDialog({
                                isOpen: true,
                                jobId: job._id,
                                jobTitle: job.title
                              })
                            }
                            disabled={actionLoading === `delete-job-${job._id}`}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Job"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(jobsPagination, setJobsPage)}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteUserDialog.isOpen}
        onCancel={() => setDeleteUserDialog({ isOpen: false, userId: null, userName: '' })}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteUserDialog.userName}"? This will also delete all associated data.`}
        confirmText={actionLoading?.startsWith('delete-user-') ? 'Deleting...' : 'Delete'}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={deleteJobDialog.isOpen}
        onCancel={() => setDeleteJobDialog({ isOpen: false, jobId: null, jobTitle: '' })}
        onConfirm={handleDeleteJob}
        title="Delete Job"
        message={`Are you sure you want to delete "${deleteJobDialog.jobTitle}"? This action cannot be undone.`}
        confirmText={actionLoading?.startsWith('delete-job-') ? 'Deleting...' : 'Delete'}
        variant="danger"
      />

      {roleDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Change User Role</h3>
            <p className="text-gray-600 mb-4">
              Change role for <span className="font-semibold">{roleDialog.userName}</span>
            </p>

            <div className="space-y-3 mb-6">
              {['admin', 'employer', 'jobseeker'].map((role) => (
                <label
                  key={role}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    roleDialog.newRole === role
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={roleDialog.newRole === role}
                    onChange={(event) =>
                      setRoleDialog((prev) => ({ ...prev, newRole: event.target.value }))
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium text-gray-900">{getRoleLabel(role)}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setRoleDialog({
                    isOpen: false,
                    userId: null,
                    userName: '',
                    currentRole: '',
                    newRole: ''
                  })
                }
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleUpdate}
                disabled={
                  roleDialog.newRole === roleDialog.currentRole ||
                  actionLoading === `role-${roleDialog.userId}`
                }
                className="btn-primary flex-1"
              >
                {actionLoading === `role-${roleDialog.userId}` ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
