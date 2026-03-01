import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { Briefcase, LayoutDashboard, FileText, User, LogOut } from 'lucide-react';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header-blur">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SkillMatch</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition duration-200">
                Dashboard
              </Link>
              <Link to="/jobs" className="text-gray-700 hover:text-primary-600 transition duration-200">
                Jobs
              </Link>
              {user?.role === 'jobseeker' && (
                <Link to="/applications" className="text-gray-700 hover:text-primary-600 transition duration-200">
                  Applications
                </Link>
              )}
              <Link to="/profile" className="text-gray-700 hover:text-primary-600 transition duration-200">
                Profile
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition duration-200">
            <LayoutDashboard size={20} />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link to="/jobs" className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition duration-200">
            <Briefcase size={20} />
            <span className="text-xs">Jobs</span>
          </Link>
          {user?.role === 'jobseeker' && (
            <Link to="/applications" className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition duration-200">
              <FileText size={20} />
              <span className="text-xs">Applications</span>
            </Link>
          )}
          <Link to="/profile" className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition duration-200">
            <User size={20} />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
      <div className="md:hidden h-20" />
    </div>
  );
};

export default MainLayout;
