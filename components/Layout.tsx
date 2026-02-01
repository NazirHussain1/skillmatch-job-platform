
import React from 'react';
import { User, UserRole } from '../types';
import { 
  Briefcase, 
  LayoutDashboard, 
  User as UserIcon, 
  ClipboardList, 
  Settings, 
  LogOut,
  Menu,
  X,
  PlusCircle,
  Users
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, role: [UserRole.JOB_SEEKER, UserRole.EMPLOYER, UserRole.ADMIN] },
    { name: 'Browse Jobs', icon: Briefcase, role: [UserRole.JOB_SEEKER] },
    { name: 'My Applications', icon: ClipboardList, role: [UserRole.JOB_SEEKER] },
    { name: 'Post a Job', icon: PlusCircle, role: [UserRole.EMPLOYER] },
    { name: 'Manage Talent', icon: Users, role: [UserRole.EMPLOYER, UserRole.ADMIN] },
    { name: 'Profile', icon: UserIcon, role: [UserRole.JOB_SEEKER, UserRole.EMPLOYER] },
    { name: 'Settings', icon: Settings, role: [UserRole.JOB_SEEKER, UserRole.EMPLOYER, UserRole.ADMIN] },
  ];

  const filteredNav = navigation.filter(item => user && item.role.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Backdrop */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen bg-white border-r border-slate-200 z-30 transition-all duration-300
        ${isSidebarOpen ? 'w-64' : 'w-20'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto' : 'w-0'}`}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Briefcase className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-slate-900 whitespace-nowrap">SkillMatch</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-4 space-y-1">
            {filteredNav.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                  ${activeTab === item.name 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                `}
              >
                <item.icon size={20} />
                <span className={`font-medium transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  {item.name}
                </span>
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100">
            {isSidebarOpen && user && (
              <div className="flex items-center gap-3 px-3 py-2 mb-4">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                  className="w-10 h-10 rounded-full border border-slate-200" 
                  alt="User"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            )}
            <button 
              onClick={onLogout}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all
                ${!isSidebarOpen && 'justify-center'}
              `}
            >
              <LogOut size={20} />
              <span className={`font-medium transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
