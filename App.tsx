
import React from 'react';
import { User, Job, Application, UserRole } from './types';
import { MOCK_USER, MOCK_EMPLOYER, MOCK_JOBS, MOCK_APPLICATIONS } from './constants';
import Layout from './components/Layout';
import JobCard from './components/JobCard';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { Briefcase, Search, Filter, Rocket } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(MOCK_USER);
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const [applications, setApplications] = React.useState<Application[]>(MOCK_APPLICATIONS);
  const [jobs] = React.useState<Job[]>(MOCK_JOBS);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleLogout = () => setUser(null);
  
  const handleApply = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      status: 'Pending',
      appliedAt: new Date().toISOString().split('T')[0],
      matchScore: 85 // In a real app, this would be computed by Gemini on application
    };
    setApplications([newApp, ...applications]);
    setActiveTab('My Applications');
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-900 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Briefcase className="text-indigo-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">SkillMatch AI</h1>
          <p className="text-slate-500">Sign in to start matching your unique skills with the world's top companies.</p>
          <div className="grid grid-cols-1 gap-4 pt-6">
            <button 
              onClick={() => setUser(MOCK_USER)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              Login as Job Seeker
            </button>
            <button 
              onClick={() => setUser(MOCK_EMPLOYER)}
              className="w-full py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
            >
              Login as Employer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === 'Dashboard' && (
        <Dashboard user={user} applications={applications} jobs={jobs} />
      )}

      {activeTab === 'Browse Jobs' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Matched Opportunities</h1>
              <p className="text-slate-500">Discover roles based on your verified skill set.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search jobs, skills, or companies..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 w-full md:w-80 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                <Filter size={20} />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} user={user} onApply={handleApply} />
            ))}
            {filteredJobs.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No matching jobs found</h3>
                <p className="text-slate-500">Try adjusting your search filters or skill set.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'My Applications' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <header>
            <h1 className="text-3xl font-bold text-slate-900">Your Applications</h1>
            <p className="text-slate-500">Track the progress of your submitted skill matches.</p>
          </header>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Job Details</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">AI Match</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{app.jobTitle}</p>
                      <p className="text-sm text-slate-500">{app.companyName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{app.appliedAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full" 
                            style={{ width: `${app.matchScore || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-indigo-600">{app.matchScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-bold
                        ${app.status === 'Accepted' ? 'bg-green-100 text-green-700' : 
                          app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-indigo-100 text-indigo-700'}
                      `}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-indigo-600 text-sm font-bold hover:underline">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {applications.length === 0 && (
              <div className="p-20 text-center">
                <Rocket className="mx-auto text-slate-200 mb-4" size={48} />
                <h3 className="text-lg font-bold text-slate-900">Blast off!</h3>
                <p className="text-slate-500 mb-6">You haven't applied to any jobs yet. Start matching today.</p>
                <button 
                  onClick={() => setActiveTab('Browse Jobs')}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  Browse Jobs
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Profile' && (
        <Profile user={user} onUpdate={setUser} />
      )}

      {(activeTab === 'Post a Job' || activeTab === 'Manage Talent' || activeTab === 'Settings') && (
        <div className="flex items-center justify-center min-h-[60vh] text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Rocket size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{activeTab}</h2>
            <p className="text-slate-500 max-w-xs mx-auto">This feature is currently under development as part of the SkillMatch v2.0 update.</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
