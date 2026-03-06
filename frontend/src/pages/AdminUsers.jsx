import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import adminService from '../services/adminService';
import { User, Trash2, Shield, Filter, Mail, Calendar } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, userId: null, userName: '' });
  const [roleDialog, setRoleDialog] = useState({ isOpen: false, userId: null, userName: '', currentRole: '', newRole: '' });

  const fetchUsers = async (role = 'all', page = 1) => {
    try {
      setIsLoading(true);
      const filters = { page, limit: 10 };
      if (role !== 'all') {
        filters.role = role;
      }
      const data = await adminService.getAllUsers(filters);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(roleFilter);
  }, [roleFilter]);

  const handleDelete = async () => {
    try {
      await adminService.deleteUser(deleteDialog.userId);
      toast.success('User deleted successfully');
      setDeleteDialog({ isOpen: false, userId: null, userName: '' });
      fetchUsers(roleFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRoleUpdate = async () => {
    try {
      await adminService.updateUserRole(roleDialog.userId, roleDialog.newRole);
      toast.success('User role updated successfully');
      setRoleDialog({ isOpen: false, userId: null, userName: '', currentRole: '', newRole: '' });
      fetchUsers(roleFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all platform users and roles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter by Role</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'admin', 'employer', 'jobseeker'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                roleFilter === role
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              {role === 'all' ? 'All Users' : getRoleLabel(role)}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          <SkeletonLoader type="list" count={10} />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          type="inbox"
          title="No users found"
          description={`No ${roleFilter === 'all' ? '' : roleFilter} users to display`}
        />
      ) : (
        <div className="glass rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
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
                      <span className={`badge ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRoleDialog({
                            isOpen: true,
                            userId: user._id,
                            userName: user.name,
                            currentRole: user.role,
                            newRole: user.role
                          })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Change Role"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({
                            isOpen: true,
                            userId: user._id,
                            userName: user.name
                          })}
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
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(pagination.pages)].map((_, index) => (
            <button
              key={index}
              onClick={() => fetchUsers(roleFilter, index + 1)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                pagination.page === index + 1
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, userId: null, userName: '' })}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteDialog.userName}"? This will also delete all their associated data.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />

      {/* Role Change Dialog */}
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
                    onChange={(e) => setRoleDialog({ ...roleDialog, newRole: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium text-gray-900">{getRoleLabel(role)}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRoleDialog({ isOpen: false, userId: null, userName: '', currentRole: '', newRole: '' })}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleUpdate}
                disabled={roleDialog.newRole === roleDialog.currentRole}
                className="btn-primary flex-1"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
