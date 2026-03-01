import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('skillmatch_token');
        if (token) {
          // Verify token and get user data
          const userData = await authService.getMe();
          if (userData) {
            setUser(userData);
            localStorage.setItem('skillmatch_user', JSON.stringify(userData));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('skillmatch_token');
            localStorage.removeItem('skillmatch_user');
          }
        }
      } catch (error) {
        console.error('Error loading user session);
        localStorage.removeItem('skillmatch_token');
        localStorage.removeItem('skillmatch_user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email) => {
    try {
      setLoading(true);
      const result = await authService.login(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('skillmatch_user', JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const result = await authService.signup(userData);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('skillmatch_user', JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const updateUser = (userData) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('skillmatch_user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

