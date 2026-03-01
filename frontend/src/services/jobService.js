import api from './api';

// Get all jobs
const getJobs = async () => {
  const response = await api.get('/jobs');
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

const jobService = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};

export default jobService;
