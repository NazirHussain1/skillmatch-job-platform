import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getAllUsers, deleteUser, updateUserRole } from '../features/admin/adminSlice';
import { User, Trash2, Shield, X } from 'lucide-react';
import Pagination from '../components/Pagination';

function AdminUsers() {
  const dispatch = useDispatch();
  const { users, usersPagination, isLoading } = useSelector((state) => state.admin);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const filters = { page, limit: 10 };
    if (filter !== 'all') {
      filters.role = filter;
    }
    dispatch(getAllUsers(filters));
  }, [dispatch, filter, page]);

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteUser(selectedUser._id)).unwrap();
      toast.success('User deleted successfully!');
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(error || 'Failed to delete user');
    }
  };

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleRoleUpdate = async () => {
    try {
      await dispatch(updateUserRole({ id: selectedUser._id, role: newRole })).unwrap();
      toast.success('User role updated successfully!');
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(error || 'Failed to update role');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-800',
      employer: 'bg-blue-100 text-blue-800',
      jobseeker: 'bg-green-100 text-green-800'
    };
    return badges[role] || badges.jobseeker;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage all platform users</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => { setFilter('all'); setPage(1); }}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => { setFilter('admin'); setPage(1); }}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'admin'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Admins
        </button>
        <button
          onClick={() => { setFilter('employer'); setPage(1); }}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'employer'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Employers
        </button>
        <button
          onClick={() => { setFilter('jobseeker'); setPage(1); }}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'jobseeker'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Jobseekers
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user._id} className="card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.companyName && (
                        <p className="text-sm text-gray-500">{user.companyName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                    
                    {user._id !== currentUser._id && (
                      <>
                        <button
                          onClick={() => handleRoleChange(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Change role"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={usersPagination.page}
            totalPages={usersPagination.pages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">No users match the selected filter</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-red-600">Delete User</h2>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedUser?.name}"? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Change User Role</h2>
              <button 
                onClick={() => setShowRoleModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Change role for "{selectedUser?.name}"
            </p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="input mb-4"
            >
              <option value="admin">Admin</option>
              <option value="employer">Employer</option>
              <option value="jobseeker">Jobseeker</option>
            </select>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRoleModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleRoleUpdate}
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
