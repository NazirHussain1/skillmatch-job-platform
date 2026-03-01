import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get my applications
const getMyApplications = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.get(`${API_URL}/applications/my`, config);
  return response.data.data;
};

// Create application
const createApplication = async (jobId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.post(`${API_URL}/applications/${jobId}`, {}, config);
  return response.data.data;
};

// Get job applications (employer)
const getJobApplications = async (jobId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.get(`${API_URL}/applications/job/${jobId}`, config);
  return response.data.data;
};

// Update application status (employer)
const updateApplicationStatus = async (id, status, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.put(`${API_URL}/applications/${id}`, { status }, config);
  return response.data.data;
};

const applicationService = {
  getMyApplications,
  createApplication,
  getJobApplications,
  updateApplicationStatus,
};

export default applicationService;
