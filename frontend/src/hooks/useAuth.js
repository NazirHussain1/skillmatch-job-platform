import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';

/**
 * useAuth Hook
 * Provides authentication utilities and auto-logout functionality
 * Validates token expiration and handles automatic logout
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;

    try {
      // Decode JWT token (without verification, just to read expiry)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiryTime;
    } catch (error) {
      // If token is malformed, consider it expired
      return true;
    }
  };

  // Auto logout if token is invalid or expired
  useEffect(() => {
    if (user && user.token) {
      if (isTokenExpired(user.token)) {
        dispatch(logout());
        navigate('/login', { replace: true });
      }
    }
  }, [user, dispatch, navigate]);

  // Check authentication status
  const isAuthenticated = () => {
    return user && user.token && !isTokenExpired(user.token);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  return {
    user,
    isAuthenticated: isAuthenticated(),
    hasRole,
    hasAnyRole,
    logout: () => dispatch(logout()),
  };
};

export default useAuth;
