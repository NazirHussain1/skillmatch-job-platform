import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { logout } from '../features/auth/authSlice';
import { Briefcase, LayoutDashboard, FileText, User, LogOut, Bookmark, MessageCircle, Menu, X, Bell } from 'lucide-react';
import notificationService from '../services/notificationService';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const desktopNotificationsRef = useRef(null);
  const mobileNotificationsRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setIsNotificationsLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setNotifications([]);
    } finally {
      setIsNotificationsLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);

    if (nextOpen) {
      await fetchNotifications();
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);

      let wasUnread = false;
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification._id === notificationId) {
            wasUnread = !notification.isRead;
            return { ...notification, isRead: true };
          }
          return notification;
        })
      );

      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      return;
    }
  };

  const formatNotificationTime = (dateString) => {
    const createdAt = new Date(dateString).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - createdAt);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  useEffect(() => {
    if (!user) return undefined;

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);

    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedDesktopBell =
        desktopNotificationsRef.current && desktopNotificationsRef.current.contains(event.target);
      const clickedMobileBell =
        mobileNotificationsRef.current && mobileNotificationsRef.current.contains(event.target);

      if (!clickedDesktopBell && !clickedMobileBell) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [location.pathname]);

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
              <div className="relative" ref={desktopNotificationsRef}>
                <button
                  onClick={handleToggleNotifications}
                  className="relative p-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-[60]">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        <span className="text-xs text-gray-500">{unreadCount} unread</span>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {isNotificationsLoading ? (
                        <div className="p-4 text-sm text-gray-500">Loading notifications...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No notifications yet.</div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 border-b border-gray-100 ${
                              notification.isRead ? 'bg-white' : 'bg-blue-50/60'
                            }`}
                          >
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkNotificationAsRead(notification._id)}
                                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-sm text-gray-600 font-medium">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Mobile Header Actions */}
            <div className="lg:hidden flex items-center gap-1 z-50">
              <div className="relative" ref={mobileNotificationsRef}>
                <button
                  onClick={handleToggleNotifications}
                  className="relative p-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-[60]">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        <span className="text-xs text-gray-500">{unreadCount} unread</span>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {isNotificationsLoading ? (
                        <div className="p-4 text-sm text-gray-500">Loading notifications...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No notifications yet.</div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 border-b border-gray-100 ${
                              notification.isRead ? 'bg-white' : 'bg-blue-50/60'
                            }`}
                          >
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkNotificationAsRead(notification._id)}
                                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
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
