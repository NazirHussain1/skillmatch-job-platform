import api from './api';

// Get all jobs
const getJobs = async (filters = {}) => {
  // Build query string from filters
  const params = new URLSearchParams();
  
  if (filters.keyword) params.append('keyword', filters.keyword);
  if (filters.location) params.append('location', filters.location);
  if (filters.salary) params.append('salary', filters.salary);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const queryString = params.toString();
  const url = queryString ? `/jobs?${queryString}` : '/jobs';
  
  const response = await api.get(url);
  
  // Return the full data object (includes jobs and pagination)
  return response.data.data;
};

// Get single job
const getJob = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data.data;
};

// Create job
const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data.data;
};

// Update job
const updateJob = async (id, jobData) => {
  const response = await api.put(`/jobs/${id}`, jobData);
  return response.data.data;
};

// Delete job
const deleteJob = async (id) => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data.data;
};

// Update job status
const updateJobStatus = async (id, status) => {
  const response = await api.patch(`/jobs/${id}/status`, { status });
  return response.data.data;
};

// Get job statistics (employer)
const getJobStats = async () => {
  const response = await api.get('/jobs/stats');
  return response.data.data;
};

const jobService = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  getJobStats,
};

export default jobService;
