import api from './api';

// Register user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  
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
  const response = await api.post('/auth/login', userData);
  
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

const authService = {
  register,
  login,
  logout
};

export default authService;
