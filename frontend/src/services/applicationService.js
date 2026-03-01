import api from './api';

// Get my applications
const getMyApplications = async () => {
  const response = await api.get('/applications/my');
  return response.data.data;
};

// Create application
const createApplication = async (jobId) => {
  const response = await api.post(`/applications/${jobId}`);
  return response.data.data;
};

// Get job applications (employer)
const getJobApplications = async (jobId) => {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data.data;
};

// Update application status (employer)
const updateApplicationStatus = async (id, status) => {
  const response = await api.put(`/applications/${id}`, { status });
  return response.data.data;
};

const applicationService = {
  getMyApplications,
  createApplication,
  getJobApplications,
  updateApplicationStatus,
};

export default applicationService;
