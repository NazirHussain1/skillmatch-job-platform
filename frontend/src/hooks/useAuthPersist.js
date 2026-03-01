import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

/**
 * useAuthPersist Hook
 * Monitors localStorage for auth changes across tabs
 * Syncs authentication state when user logs out in another tab
 */
const useAuthPersist = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for storage events (changes in other tabs)
    const handleStorageChange = (e) => {
      // If user key is removed from localStorage (logout in another tab)
      if (e.key === 'user' && e.newValue === null) {
        dispatch(logout());
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]);

  // Validate localStorage on mount
  useEffect(() => {
    const validateAuth = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          
          // Check if user object has required fields
          if (!user.token || !user._id || !user.email) {
            localStorage.removeItem('user');
            dispatch(logout());
          }
        }
      } catch (error) {
        // If localStorage data is corrupted, clear it
        localStorage.removeItem('user');
        dispatch(logout());
      }
    };

    validateAuth();
  }, [dispatch]);
};

export default useAuthPersist;
