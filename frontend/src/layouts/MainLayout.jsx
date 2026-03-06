import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { logout } from '../features/auth/authSlice';
import { Briefcase, LayoutDashboard, FileText, User, LogOut, Bookmark, MessageCircle, Menu, X } from 'lucide-react';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <header className="header-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 z-50">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SkillMatch
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link to="/dashboard" className="px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                Dashboard
              </Link>
              <Link to="/jobs" className="px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                Jobs
              </Link>
              <Link to="/chat" className="px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                Messages
              </Link>
              {user?.role === 'jobseeker' && (
                <>
                  <Link to="/applications" className="px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                    Applications
                  </Link>
                  <Link to="/saved-jobs" className="px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                    Saved Jobs
                  </Link>
                </>
              )}
              {user?.role === 'employer' && (
                <Link to="/my-jobs" className="px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                  My Jobs
                </Link>
              )}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className="px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                    Analytics
                  </Link>
                  <Link to="/admin/users" className="px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                    Users
                  </Link>
                  <Link to="/admin/jobs" className="px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                    All Jobs
                  </Link>
                </>
              )}
              <Link to="/profile" className="px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                Profile
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors z-50"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Menu Drawer */}
        <div className={`lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            {/* Mobile Menu Links */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                <Link 
                  to="/dashboard" 
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </Link>
                <Link 
                  to="/jobs" 
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                >
                  <Briefcase size={20} />
                  Jobs
                </Link>
                <Link 
                  to="/chat" 
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                >
                  <MessageCircle size={20} />
                  Messages
                </Link>
                {user?.role === 'jobseeker' && (
                  <>
                    <Link 
                      to="/applications" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                    >
                      <FileText size={20} />
                      Applications
                    </Link>
                    <Link 
                      to="/saved-jobs" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                    >
                      <Bookmark size={20} />
                      Saved Jobs
                    </Link>
                  </>
                )}
                {user?.role === 'employer' && (
                  <Link 
                    to="/my-jobs" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                  >
                    <FileText size={20} />
                    My Jobs
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <>
                    <Link 
                      to="/admin" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                    >
                      <LayoutDashboard size={20} />
                      Analytics
                    </Link>
                    <Link 
                      to="/admin/users" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                    >
                      <User size={20} />
                      Users
                    </Link>
                    <Link 
                      to="/admin/jobs" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                    >
                      <Briefcase size={20} />
                      All Jobs
                    </Link>
                  </>
                )}
                <Link 
                  to="/profile" 
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                >
                  <User size={20} />
                  Profile
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 font-medium"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-40">
        <div className={`grid ${user?.role === 'jobseeker' ? 'grid-cols-5' : user?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-4'} gap-1 px-2 py-2`}>
          <Link to="/dashboard" className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-95">
            <LayoutDashboard size={22} strokeWidth={2} />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link to="/jobs" className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-95">
            <Briefcase size={22} strokeWidth={2} />
            <span className="text-xs font-medium">Jobs</span>
          </Link>
          {user?.role === 'jobseeker' && (
            <>
              <Link to="/applications" className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-95">
                <FileText size={22} strokeWidth={2} />
                <span className="text-xs font-medium">Applied</span>
              </Link>
              <Link to="/saved-jobs" className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-95">
                <Bookmark size={22} strokeWidth={2} />
                <span className="text-xs font-medium">Saved</span>
              </Link>
            </>
          )}
          {user?.role === 'employer' && (
            <Link to="/my-jobs" className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-95">
              <FileText size={22} strokeWidth={2} />
              <span className="text-xs font-medium">My Jobs</span>
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-95">
              <LayoutDashboard size={22} strokeWidth={2} />
              <span className="text-xs font-medium">Admin</span>
            </Link>
          )}
          <Link to="/profile" className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-95">
            <User size={22} strokeWidth={2} />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
      
      {/* Bottom Navigation Spacer */}
      <div className="lg:hidden h-20" />
    </div>
  );
};

export default MainLayout;
