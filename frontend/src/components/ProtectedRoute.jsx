import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 * Preserves the intended destination for redirect after login
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    // Redirect to login and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
