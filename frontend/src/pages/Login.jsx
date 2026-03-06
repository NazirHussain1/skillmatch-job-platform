import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { login, reset } from '../features/auth/authSlice';
import { Briefcase, Mail, Lock } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isError) {
      // Check if error is about email verification
      if (message && message.toLowerCase().includes('verify your email')) {
        toast.error(message, {
          duration: 5000,
        });
        // Show resend verification link
        setTimeout(() => {
          toast((t) => (
            <div className="flex flex-col gap-2">
              <span>Need a new verification link?</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate('/resend-verification');
                }}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Resend Verification Email
              </button>
            </div>
          ), {
            duration: 8000,
          });
        }, 1000);
      } else {
        toast.error(message);
      }
    }

    if (isSuccess || user) {
      // Redirect to the page they were trying to access
      navigate(from, { replace: true });
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch, from]);

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Briefcase className="w-10 h-10 text-primary-600" />
            <span className="text-3xl font-bold text-gray-900">SkillMatch</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  className="input pl-10"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  className="input pl-10"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

