import axios from 'axios';
import { toast } from 'react-hot-toast';

// Base URL from environment variable or default
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

const isPublicAuthRequest = (url = '') =>
  [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/resend-verification',
  ].some((path) => url.startsWith(path));

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
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // If user has token, add it to request headers
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch {
        // If localStorage data is corrupted, clear it
        localStorage.removeItem('user');
      }
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
    if (!error.response) {
      toast.error('Network error: Unable to reach server. Please check backend/CORS settings.');
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // Handle 401 Unauthorized for protected requests only. Public auth screens
    // need to show their own validation message without forcing a redirect.
    if (
      status === 401 &&
      error.config?.headers?.Authorization &&
      !isPublicAuthRequest(error.config?.url) &&
      window.location.pathname !== '/login'
    ) {
      // Clear user from localStorage
      localStorage.removeItem('user');
      
      // Show toast notification
      toast.error('Session expired. Please login again.');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.assign('/login');
      }, 1000);
    }
    
    // Handle 403 Forbidden - insufficient permissions
    if (status === 403) {
      toast.error('You do not have permission to perform this action.');
    }

    // Handle 404 Not Found
    if (status === 404) {
      toast.error(message || 'Resource not found.');
    }

    // Handle 500 Server Error
    if (status === 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
