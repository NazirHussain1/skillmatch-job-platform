import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  ClipboardList, 
  User, 
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['candidate', 'employer', 'admin'] },
    { name: 'Browse Jobs', href: '/jobs', icon: Briefcase, roles: ['candidate'] },
    { name: 'My Applications', href: '/applications', icon: ClipboardList, roles: ['candidate'] },
    { name: 'Post Job', href: '/post-job', icon: Briefcase, roles: ['employer'] },
    { name: 'Profile', href: '/profile', icon: User, roles: ['candidate', 'employer'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['candidate', 'employer', 'admin'] },
  ];

  const filteredNav = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  const isActive = (href) => location.pathname === href;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar - Sticky */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left: Logo & Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">SkillMatch</span>
            </div>
          </div>

          {/* Center: Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop (Collapsible) */}
        <aside
          className={`
            hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200
            transition-all duration-200 ease-in-out z-40
            ${sidebarOpen ? 'w-64' : 'w-20'}
          `}
        >
          <nav className="h-full flex flex-col p-4 overflow-y-auto">
            <div className="flex-1 space-y-1">
              {filteredNav.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg
                    transition-all duration-200 ease-in-out
                    ${isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                    ${!sidebarOpen && 'justify-center'}
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                text-red-600 hover:bg-red-50 transition-all duration-200 ease-in-out
                ${!sidebarOpen && 'justify-center'}
              `}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
            </button>
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="lg:hidden fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-50 transition-transform duration-200 ease-in-out">
              <nav className="h-full flex flex-col p-4 overflow-y-auto">
                <div className="flex-1 space-y-1">
                  {filteredNav.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-3 rounded-lg
                        transition-all duration-200 ease-in-out
                        ${isActive(item.href)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 ease-in-out"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium text-sm">Logout</span>
                </button>
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main
          className={`
            flex-1 min-h-[calc(100vh-4rem)]
            transition-all duration-200 ease-in-out
            lg:ml-${sidebarOpen ? '64' : '20'}
          `}
          style={{
            marginLeft: window.innerWidth >= 1024 ? (sidebarOpen ? '16rem' : '5rem') : '0'
          }}
        >
          <div className="container-custom py-6 sm:py-8 lg:py-12">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {filteredNav.slice(0, 5).map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`
                flex flex-col items-center gap-1 px-2 py-2 rounded-lg
                transition-all duration-200 ease-in-out
                ${isActive(item.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate w-full text-center">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile navigation */}
      <div className="lg:hidden h-20" />
    </div>
  );
};

export default AppLayout;
