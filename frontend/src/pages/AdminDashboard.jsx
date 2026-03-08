import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Users,
  Briefcase,
  FileText,
  Building2,
  Filter,
  User,
  Mail,
  Calendar,
  Shield,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import adminService from '../services/adminService';
import ConfirmDialog from '../components/ConfirmDialog';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const usersPerPage = 10;
const jobsPerPage = 10;

const roleFilters = ['all', 'admin', 'employer', 'jobseeker'];
const roleOptions = roleFilters.filter((role) => role !== 'all');
const statusFilters = ['all', 'pending', 'active', 'rejected', 'closed'];

const ROLE_LABELS = {
  admin: 'Admin',
  employer: 'Employer',
  jobseeker: 'Job Seeker'
};

const ROLE_BADGES = {
  admin: 'badge-danger',
  employer: 'badge-primary',
  jobseeker: 'badge-success'
};

const STATUS_BADGES = {
  active: 'badge-success',
  pending: 'badge-warning',
  rejected: 'badge-danger',
  closed: 'badge-secondary'
};

const formatRoleLabel = (role) => ROLE_LABELS[role] || role;

const formatStatusLabel = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (value) => new Date(value).toLocaleDateString('en-US');

const TablePagination = ({ pagination, onPageChange, label }) => {
  if (!pagination || pagination.pages <= 1) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6" aria-label={`${label} pagination`}>
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

const FilterPills = ({ label, options, activeValue, onChange, getLabel }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <Filter className="h-4 w-4 text-gray-600" />
      <span>{label}</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option === activeValue;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={isActive}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              isActive
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {getLabel(option)}
          </button>
        );
      })}
    </div>
  </div>
);

const AnalyticsCards = ({ analytics, isLoading }) => {
  const cards = useMemo(
    () => [
      {
        id: 'users',
        title: 'Total Users',
        value: analytics?.overview?.totalUsers ?? 0,
        icon: Users,
        iconClasses: 'bg-blue-100 text-blue-600'
      },
      {
        id: 'employers',
        title: 'Total Employers',
        value: analytics?.overview?.totalEmployers ?? 0,
        icon: Building2,
        iconClasses: 'bg-indigo-100 text-indigo-600'
      },
      {
        id: 'jobs',
        title: 'Total Jobs',
        value: analytics?.overview?.totalJobs ?? 0,
        icon: Briefcase,
        iconClasses: 'bg-orange-100 text-orange-600'
      },
      {
        id: 'applications',
        title: 'Total Applications',
        value: analytics?.overview?.totalApplications ?? 0,
        icon: FileText,
        iconClasses: 'bg-emerald-100 text-emerald-600'
      }
    ],
    [analytics]
  );

  return (
    <section aria-label="Analytics overview">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <SkeletonLoader type="stat" count={4} />
        ) : (
          cards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconClasses}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

const UsersTableSection = ({
  users,
  isLoading,
  pagination,
  roleFilter,
  onRoleFilterChange,
  onPageChange,
  onOpenRoleDialog,
  onOpenDeleteDialog,
  actionLoading
}) => (
  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="space-y-4 border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">Users</h2>
        <p className="text-sm text-gray-500">{pagination?.total || 0} total</p>
      </div>

      <FilterPills
        label="Filter by role"
        options={roleFilters}
        activeValue={roleFilter}
        onChange={onRoleFilterChange}
        getLabel={(option) => (option === 'all' ? 'All Users' : formatRoleLabel(option))}
      />
    </div>

    {isLoading ? (
      <div className="p-6">
        <SkeletonLoader type="list" count={8} />
      </div>
    ) : users.length === 0 ? (
      <div className="p-6">
        <EmptyState
          type="inbox"
          title="No users found"
          description={`No ${roleFilter === 'all' ? '' : roleFilter} users to display.`}
        />
      </div>
    ) : (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm" role="table">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 sm:px-6">
                  User
                </th>
                <th scope="col" className="px-4 py-3 sm:px-6">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 sm:px-6">
                  Role
                </th>
                <th scope="col" className="px-4 py-3 sm:px-6">
                  Joined
                </th>
                <th scope="col" className="px-4 py-3 text-right sm:px-6">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((user) => (
                <tr key={user._id} className="transition-colors duration-200 hover:bg-blue-50/40">
                  <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <User className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        {user.companyName && <p className="text-sm text-gray-500">{user.companyName}</p>}
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      <span>{user.email}</span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                    <span className={`badge ${ROLE_BADGES[user.role] || 'badge-secondary'}`}>
                      {formatRoleLabel(user.role)}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right sm:px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenRoleDialog(user)}
                        disabled={actionLoading?.startsWith('role-')}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 transition-colors duration-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        title="Change role"
                        aria-label={`Change role for ${user.name}`}
                      >
                        <Shield className="h-5 w-5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenDeleteDialog(user)}
                        disabled={actionLoading === `delete-user-${user._id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        title="Delete user"
                        aria-label={`Delete user ${user.name}`}
                      >
                        <Trash2 className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination pagination={pagination} onPageChange={onPageChange} label="Users" />
      </>
    )}
  </section>
);

const JobsTableSection = ({
  jobs,
  isLoading,
  pagination,
  statusFilter,
  onStatusFilterChange,
  onPageChange,
  onOpenModerationDialog,
  onOpenDeleteDialog,
  actionLoading
}) => (
  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="space-y-4 border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">Jobs</h2>
        <p className="text-sm text-gray-500">{pagination?.total || 0} total</p>
      </div>

      <FilterPills
        label="Filter by status"
        options={statusFilters}
        activeValue={statusFilter}
        onChange={onStatusFilterChange}
        getLabel={(option) => (option === 'all' ? 'All Jobs' : formatStatusLabel(option))}
      />
    </div>

    {isLoading ? (
      <div className="p-6">
        <SkeletonLoader type="list" count={8} />
      </div>
    ) : jobs.length === 0 ? (
      <div className="p-6">
        <EmptyState
          type="jobs"
          title="No jobs found"
          description={`No ${statusFilter === 'all' ? '' : statusFilter} jobs to display.`}
        />
      </div>
    ) : (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left text-sm" role="table">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 sm:px-6">
                  Job
                </th>
                <th scope="col" className="px-4 py-3 sm:px-6">
                  Company
                </th>
                <th scope="col" className="px-4 py-3 sm:px-6">
                  Employer
                </th>
                <th scope="col" className="px-4 py-3 sm:px-6">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 sm:px-6">
                  Posted
                </th>
                <th scope="col" className="px-4 py-3 text-right sm:px-6">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {jobs.map((job) => (
                <tr key={job._id} className="transition-colors duration-200 hover:bg-blue-50/40">
                  <td className="px-4 py-4 sm:px-6">
                    <p className="font-semibold text-gray-900">{job.title}</p>
                    {job.category && <p className="text-sm text-gray-500">{job.category}</p>}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Building2 className="h-4 w-4" aria-hidden="true" />
                      <span>{job.company}</span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 sm:px-6 text-gray-600">
                    {job.employer?.name || 'Unknown'}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                    <span className={`badge ${STATUS_BADGES[job.status] || 'badge-secondary'}`}>
                      {formatStatusLabel(job.status)}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 sm:px-6 text-gray-600">
                    {formatDate(job.createdAt)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right sm:px-6">
                    <div className="flex items-center justify-end gap-2">
                      {(job.status === 'pending' || job.status === 'rejected' || job.status === 'closed') && (
                        <button
                          type="button"
                          onClick={() => onOpenModerationDialog(job, 'approve')}
                          disabled={actionLoading === `approve-${job._id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-emerald-600 transition-colors duration-200 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                          title="Approve job"
                          aria-label={`Approve job ${job.title}`}
                        >
                          <CheckCircle className="h-5 w-5" aria-hidden="true" />
                        </button>
                      )}

                      {(job.status === 'pending' || job.status === 'active') && (
                        <button
                          type="button"
                          onClick={() => onOpenModerationDialog(job, 'reject')}
                          disabled={actionLoading === `reject-${job._id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-amber-600 transition-colors duration-200 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                          title="Reject job"
                          aria-label={`Reject job ${job.title}`}
                        >
                          <XCircle className="h-5 w-5" aria-hidden="true" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenDeleteDialog(job)}
                        disabled={actionLoading === `delete-job-${job._id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        title="Delete job"
                        aria-label={`Delete job ${job.title}`}
                      >
                        <Trash2 className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination pagination={pagination} onPageChange={onPageChange} label="Jobs" />
      </>
    )}
  </section>
);

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, pages: 0, total: 0 });
  const [jobsPagination, setJobsPagination] = useState({ page: 1, pages: 0, total: 0 });

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
  const [moderationDialog, setModerationDialog] = useState({
    isOpen: false,
    action: '',
    jobId: null,
    jobTitle: ''
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
      setUsers(data.users || []);
      setUsersPagination(data.pagination || { page: 1, pages: 0, total: 0 });
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
      setJobs(data.jobs || []);
      setJobsPagination(data.pagination || { page: 1, pages: 0, total: 0 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserDialog.userId) return;

    try {
      setActionLoading(`delete-user-${deleteUserDialog.userId}`);
      await adminService.deleteUser(deleteUserDialog.userId);
      toast.success('User deleted successfully');
      setDeleteUserDialog({ isOpen: false, userId: null, userName: '' });
      await Promise.all([fetchUsers(roleFilter, usersPage), fetchAnalytics()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteJobDialog.jobId) return;

    try {
      setActionLoading(`delete-job-${deleteJobDialog.jobId}`);
      await adminService.deleteJob(deleteJobDialog.jobId);
      toast.success('Job deleted successfully');
      setDeleteJobDialog({ isOpen: false, jobId: null, jobTitle: '' });
      await Promise.all([fetchJobs(statusFilter, jobsPage), fetchAnalytics()]);
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
      await adminService.updateUserRole(roleDialog.userId, roleDialog.newRole);
      toast.success('User role updated successfully');
      setRoleDialog({
        isOpen: false,
        userId: null,
        userName: '',
        currentRole: '',
        newRole: ''
      });
      await Promise.all([fetchUsers(roleFilter, usersPage), fetchAnalytics()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleModerationAction = async () => {
    if (!moderationDialog.jobId || !moderationDialog.action) return;

    const key = `${moderationDialog.action}-${moderationDialog.jobId}`;

    try {
      setActionLoading(key);

      if (moderationDialog.action === 'approve') {
        await adminService.approveJob(moderationDialog.jobId);
        toast.success('Job approved successfully');
      } else {
        await adminService.rejectJob(moderationDialog.jobId);
        toast.success('Job rejected successfully');
      }

      setModerationDialog({
        isOpen: false,
        action: '',
        jobId: null,
        jobTitle: ''
      });

      await Promise.all([fetchJobs(statusFilter, jobsPage), fetchAnalytics()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job status');
    } finally {
      setActionLoading(null);
    }
  };

  const roleDialogMessage = (
    <div className="space-y-3">
      <p>
        Change role for <span className="font-semibold text-gray-900">{roleDialog.userName}</span>.
      </p>
      <fieldset className="space-y-2" aria-label="Select user role">
        {roleOptions.map((role) => (
          <label
            key={role}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-200 ${
              roleDialog.newRole === role
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="admin-role"
              value={role}
              checked={roleDialog.newRole === role}
              onChange={(event) =>
                setRoleDialog((prevState) => ({
                  ...prevState,
                  newRole: event.target.value
                }))
              }
              className="h-4 w-4 accent-blue-600"
            />
            <span className="font-medium text-gray-800">{formatRoleLabel(role)}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );

  const moderationActionLabel =
    moderationDialog.action === 'approve' ? 'Approve' : moderationDialog.action === 'reject' ? 'Reject' : 'Confirm';

  const moderationLoadingKey = `${moderationDialog.action}-${moderationDialog.jobId}`;
  const isModerationLoading = actionLoading === moderationLoadingKey;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-600">
          Monitor platform health and manage users, jobs, and moderation workflows.
        </p>
      </header>

      <AnalyticsCards analytics={analytics} isLoading={isLoadingAnalytics} />

      <UsersTableSection
        users={users}
        isLoading={isLoadingUsers}
        pagination={usersPagination}
        roleFilter={roleFilter}
        onRoleFilterChange={(value) => {
          setRoleFilter(value);
          setUsersPage(1);
        }}
        onPageChange={setUsersPage}
        onOpenRoleDialog={(user) =>
          setRoleDialog({
            isOpen: true,
            userId: user._id,
            userName: user.name,
            currentRole: user.role,
            newRole: user.role
          })
        }
        onOpenDeleteDialog={(user) =>
          setDeleteUserDialog({
            isOpen: true,
            userId: user._id,
            userName: user.name
          })
        }
        actionLoading={actionLoading}
      />

      <JobsTableSection
        jobs={jobs}
        isLoading={isLoadingJobs}
        pagination={jobsPagination}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setJobsPage(1);
        }}
        onPageChange={setJobsPage}
        onOpenModerationDialog={(job, action) =>
          setModerationDialog({
            isOpen: true,
            action,
            jobId: job._id,
            jobTitle: job.title
          })
        }
        onOpenDeleteDialog={(job) =>
          setDeleteJobDialog({
            isOpen: true,
            jobId: job._id,
            jobTitle: job.title
          })
        }
        actionLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={deleteUserDialog.isOpen}
        onCancel={() => setDeleteUserDialog({ isOpen: false, userId: null, userName: '' })}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteUserDialog.userName}"? This will remove related data as well.`}
        confirmText={actionLoading?.startsWith('delete-user-') ? 'Deleting...' : 'Delete'}
        confirmDisabled={actionLoading?.startsWith('delete-user-')}
        cancelDisabled={actionLoading?.startsWith('delete-user-')}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={deleteJobDialog.isOpen}
        onCancel={() => setDeleteJobDialog({ isOpen: false, jobId: null, jobTitle: '' })}
        onConfirm={handleDeleteJob}
        title="Delete Job"
        message={`Are you sure you want to delete "${deleteJobDialog.jobTitle}"? This action cannot be undone.`}
        confirmText={actionLoading?.startsWith('delete-job-') ? 'Deleting...' : 'Delete'}
        confirmDisabled={actionLoading?.startsWith('delete-job-')}
        cancelDisabled={actionLoading?.startsWith('delete-job-')}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={moderationDialog.isOpen}
        onCancel={() =>
          setModerationDialog({
            isOpen: false,
            action: '',
            jobId: null,
            jobTitle: ''
          })
        }
        onConfirm={handleModerationAction}
        title={`${moderationActionLabel} Job`}
        message={`Are you sure you want to ${moderationActionLabel.toLowerCase()} "${moderationDialog.jobTitle}"?`}
        confirmText={isModerationLoading ? `${moderationActionLabel}ing...` : moderationActionLabel}
        confirmDisabled={isModerationLoading}
        cancelDisabled={isModerationLoading}
        variant={moderationDialog.action === 'approve' ? 'info' : 'warning'}
      />

      <ConfirmDialog
        isOpen={roleDialog.isOpen}
        onCancel={() =>
          setRoleDialog({
            isOpen: false,
            userId: null,
            userName: '',
            currentRole: '',
            newRole: ''
          })
        }
        onConfirm={handleRoleUpdate}
        title="Update User Role"
        message={roleDialogMessage}
        confirmText={actionLoading?.startsWith('role-') ? 'Updating...' : 'Update Role'}
        confirmDisabled={roleDialog.newRole === roleDialog.currentRole || actionLoading?.startsWith('role-')}
        cancelDisabled={actionLoading?.startsWith('role-')}
        variant="info"
      />
    </div>
  );
}

export default AdminDashboard;
