import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * RoleBasedRoute Component
 * Restricts access based on user role
 * Redirects to dashboard if user doesn't have required role
 * 
 * @param {Array} allowedRoles - Array of roles that can access this route
 * @param {ReactNode} children - Child components to render
 * @param {string} redirectTo - Where to redirect if access denied (default: /dashboard)
 */
const RoleBasedRoute = ({ children, allowedRoles, redirectTo = '/dashboard' }) => {
  const { user } = useSelector((state) => state.auth);

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleBasedRoute;
