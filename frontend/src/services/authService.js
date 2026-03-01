import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  
  if (response.data.data) {
    const user = {
      ...response.data.data,
      token: response.data.data.token
    };
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  
  return response.data.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  
  if (response.data.data) {
    const user = {
      ...response.data.data,
      token: response.data.data.token
    };
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  
  return response.data.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get profile
const getProfile = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.get(`${API_URL}/auth/profile`, config);
  return response.data.data;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
};

export default authService;
