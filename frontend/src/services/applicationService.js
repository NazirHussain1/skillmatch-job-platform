import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get user applications
const getApplications = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.get(`${API_URL}/applications`, config);
  return response.data;
};

// Create application
const createApplication = async (applicationData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.post(`${API_URL}/applications`, applicationData, config);
  return response.data;
};

// Delete application
const deleteApplication = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.delete(`${API_URL}/applications/${id}`, config);
  return response.data;
};

const applicationService = {
  getApplications,
  createApplication,
  deleteApplication,
};

export default applicationService;
