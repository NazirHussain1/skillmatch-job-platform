import api from './api';

// Get user profile
const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data.data;
};

// Update user profile
const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data.data;
};

// Upload resume
const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await api.post('/users/profile/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// Save job
const saveJob = async (jobId) => {
  const response = await api.post(`/users/saved-jobs/${jobId}`);
  return response.data.data;
};

// Unsave job
const unsaveJob = async (jobId) => {
  const response = await api.delete(`/users/saved-jobs/${jobId}`);
  return response.data.data;
};

// Get saved jobs
const getSavedJobs = async () => {
  const response = await api.get('/users/saved-jobs');
  return response.data.data;
};

const userService = {
  getUserProfile,
  updateUserProfile,
  uploadResume,
  saveJob,
  unsaveJob,
  getSavedJobs,
};

export default userService;
