import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * PublicRoute Component
 * For routes that should only be accessible when NOT authenticated
 * (e.g., login, register pages)
 * Redirects to dashboard if user is already logged in
 */
const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    // User is already authenticated, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
