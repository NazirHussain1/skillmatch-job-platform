import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthPersist from './hooks/useAuthPersist';
import LoadingSpinner from './components/LoadingSpinner';

// Route Components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RegistrationSuccess = lazy(() => import('./pages/RegistrationSuccess'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResendVerification = lazy(() => import('./pages/ResendVerification'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Applications = lazy(() => import('./pages/Applications'));
const Profile = lazy(() => import('./pages/Profile'));
const MyJobs = lazy(() => import('./pages/MyJobs'));
const JobApplicants = lazy(() => import('./pages/JobApplicants'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminJobs = lazy(() => import('./pages/AdminJobs'));
const SavedJobs = lazy(() => import('./pages/SavedJobs'));
const Chat = lazy(() => import('./pages/Chat'));

function App() {
  useAuthPersist();

  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<LoadingSpinner size="large" />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          
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

          <Route 
            path="/registration-success" 
            element={
              <PublicRoute>
                <RegistrationSuccess />
              </PublicRoute>
            } 
          />

          <Route 
            path="/verify-email/:token" 
            element={
              <PublicRoute>
                <VerifyEmail />
              </PublicRoute>
            } 
          />

          <Route 
            path="/resend-verification" 
            element={
              <PublicRoute>
                <ResendVerification />
              </PublicRoute>
            } 
          />

          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } 
          />

          <Route 
            path="/reset-password/:token" 
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } 
          />

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

          <Route 
            path="/saved-jobs" 
            element={
              <RoleBasedRoute allowedRoles={['jobseeker']}>
                <MainLayout>
                  <SavedJobs />
                </MainLayout>
              </RoleBasedRoute>
            } 
          />

          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Chat />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/my-jobs" 
            element={
              <RoleBasedRoute allowedRoles={['employer']}>
                <MainLayout>
                  <MyJobs />
                </MainLayout>
              </RoleBasedRoute>
            } 
          />

          <Route 
            path="/my-jobs/:jobId/applicants" 
            element={
              <RoleBasedRoute allowedRoles={['employer']}>
                <MainLayout>
                  <JobApplicants />
                </MainLayout>
              </RoleBasedRoute>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </RoleBasedRoute>
            } 
          />

          <Route 
            path="/admin/users" 
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <AdminUsers />
                </MainLayout>
              </RoleBasedRoute>
            } 
          />

          <Route 
            path="/admin/jobs" 
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <AdminJobs />
                </MainLayout>
              </RoleBasedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
