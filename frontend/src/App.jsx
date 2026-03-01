import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

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
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" /> : <Register />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={user ? <MainLayout><Dashboard /></MainLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/jobs" 
          element={user ? <MainLayout><Jobs /></MainLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/applications" 
          element={user ? <MainLayout><Applications /></MainLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <MainLayout><Profile /></MainLayout> : <Navigate to="/login" />} 
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
