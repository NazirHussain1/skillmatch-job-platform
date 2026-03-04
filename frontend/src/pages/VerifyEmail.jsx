import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { setCredentials } from '../features/auth/authSlice';

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        
        // Save user data and token
        dispatch(setCredentials(response.data.data));
        localStorage.setItem('user', JSON.stringify(response.data.data));
        
        setStatus('success');
        toast.success('Email verified successfully!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (error) {
        setStatus('error');
        toast.error(error.response?.data?.message || 'Failed to verify email');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate, dispatch]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 px-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 px-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been verified successfully. You can now access all features of SkillMatch.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to dashboard...
            </p>
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">
            The verification link is invalid or has expired. Please request a new verification email.
          </p>
          <div className="space-y-3">
            <Link to="/resend-verification" className="btn-primary w-full block">
              Resend Verification Email
            </Link>
            <Link to="/login" className="btn-secondary w-full block">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
