import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthPersist from './hooks/useAuthPersist';

// Route Components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Profile from './pages/Profile';

function App() {
  // Enable auth persistence across tabs
  useAuthPersist();

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes - Only accessible when NOT logged in */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Protected Routes - Require authentication */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/jobs" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Jobs />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Role-Based Route - Only for jobseekers */}
        <Route 
          path="/applications" 
          element={
            <RoleBasedRoute allowedRoles={['jobseeker']}>
              <MainLayout>
                <Applications />
              </MainLayout>
            </RoleBasedRoute>
          } 
        />

        {/* Catch all - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
