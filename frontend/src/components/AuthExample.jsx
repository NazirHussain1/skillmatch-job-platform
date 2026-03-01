import useAuth from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

/**
 * AuthExample Component
 * Demonstrates how to use the useAuth hook for conditional rendering
 * and role-based UI logic
 */
function AuthExample() {
  const { user, isAuthenticated, hasRole, hasAnyRole, logout } = useAuth();

  // Example 1: Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Example 2: Conditional rendering based on role
  const renderDashboard = () => {
    if (hasRole('employer')) {
      return (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Employer Dashboard</h2>
          <p>Manage your job postings and view applications.</p>
          <button className="btn-primary mt-4">Post New Job</button>
        </div>
      );
    }

    if (hasRole('jobseeker')) {
      return (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Jobseeker Dashboard</h2>
          <p>Browse jobs and track your applications.</p>
          <button className="btn-primary mt-4">Browse Jobs</button>
        </div>
      );
    }

    if (hasRole('admin')) {
      return (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
          <p>Manage users, jobs, and applications.</p>
          <button className="btn-primary mt-4">Admin Panel</button>
        </div>
      );
    }

    return null;
  };

  // Example 3: Check multiple roles
  const canManageContent = hasAnyRole(['admin', 'employer']);

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">User Information</h3>
        <p className="text-gray-600">Name: {user.name}</p>
        <p className="text-gray-600">Email: {user.email}</p>
        <p className="text-gray-600">Role: {user.role}</p>
      </div>

      {/* Role-based Dashboard */}
      {renderDashboard()}

      {/* Conditional Features */}
      {canManageContent && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Content Management</h3>
          <p className="text-gray-600">You have access to content management features.</p>
        </div>
      )}

      {/* Logout Button */}
      <button onClick={logout} className="btn-secondary">
        Logout
      </button>
    </div>
  );
}

export default AuthExample;
