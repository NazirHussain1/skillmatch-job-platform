import axios from 'axios';

// Base URL from environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    
    // If user has token, add it to request headers
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear user from localStorage
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
