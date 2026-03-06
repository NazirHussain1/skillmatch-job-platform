import api from './api';

// Get all users
const getAllUsers = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.role) params.append('role', filters.role);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const queryString = params.toString();
  const url = queryString ? `/admin/users?${queryString}` : '/admin/users';
  
  const response = await api.get(url);
  return response.data.data;
};

// Delete user
const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data.data;
};

// Update user role
const updateUserRole = async (id, role) => {
  const response = await api.put(`/admin/users/${id}/role`, { role });
  return response.data.data;
};

// Get all jobs (admin)
const getAllJobs = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const queryString = params.toString();
  const url = queryString ? `/admin/jobs?${queryString}` : '/admin/jobs';
  
  const response = await api.get(url);
  return response.data.data;
};

// Delete job (admin)
const deleteJob = async (id) => {
  const response = await api.delete(`/admin/jobs/${id}`);
  return response.data.data;
};

// Get analytics
const getAnalytics = async () => {
  const response = await api.get('/admin/analytics');
  return response.data.data;
};

// Get jobs by status
const getJobsByStatus = async (status, filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const queryString = params.toString();
  const url = queryString ? `/admin/jobs/status/${status}?${queryString}` : `/admin/jobs/status/${status}`;
  
  const response = await api.get(url);
  return response.data.data;
};

// Approve job
const approveJob = async (id) => {
  const response = await api.put(`/admin/jobs/${id}/approve`);
  return response.data.data;
};

// Reject job
const rejectJob = async (id) => {
  const response = await api.put(`/admin/jobs/${id}/reject`);
  return response.data.data;
};

const adminService = {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllJobs,
  deleteJob,
  getAnalytics,
  getJobsByStatus,
  approveJob,
  rejectJob
};

export default adminService;
