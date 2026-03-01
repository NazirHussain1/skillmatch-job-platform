import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all jobs
const getJobs = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`${API_URL}/jobs?${params}`);
  return response.data;
};

// Get single job
const getJob = async (id) => {
  const response = await axios.get(`${API_URL}/jobs/${id}`);
  return response.data;
};

// Create job
const createJob = async (jobData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.post(`${API_URL}/jobs`, jobData, config);
  return response.data;
};

// Update job
const updateJob = async (id, jobData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.put(`${API_URL}/jobs/${id}`, jobData, config);
  return response.data;
};

// Delete job
const deleteJob = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.delete(`${API_URL}/jobs/${id}`, config);
  return response.data;
};

const jobService = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};

export default jobService;
