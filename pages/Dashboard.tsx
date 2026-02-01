
import React from 'react';
import { User, UserRole, Application, Job } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, Briefcase, CheckCircle } from 'lucide-react';

interface DashboardProps {
  user: User;
  applications: Application[];
  jobs: Job[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, applications, jobs }) => {
  const chartData = [
    { name: 'Jan', value: 4 },
    { name: 'Feb', value: 7 },
    { name: 'Mar', value: 5 },
    { name: 'Apr', value: 12 },
    { name: 'May', value: 9 },
  ];

  const seekerStats = [
    { label: 'Applied Jobs', value: applications.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Interviews', value: 2, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Offers', value: 1, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Profile Views', value: '42', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const employerStats = [
    { label: 'Active Postings', value: jobs.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'New Applicants', value: 18, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Hired', value: 3, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Matches Found', value: '124', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const stats = user.role === UserRole.JOB_SEEKER ? seekerStats : employerStats;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name} 👋</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your recruitment process today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">Activity Overview</h2>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none">
              <option>Last 6 months</option>
              <option>Last 12 months</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#4f46e5' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Applications/Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Status</h2>
          <div className="space-y-6">
            {(user.role === UserRole.JOB_SEEKER ? applications : []).slice(0, 4).map((app) => (
              <div key={app.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">
                  {app.companyName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{app.jobTitle}</p>
                  <p className="text-xs text-slate-500 mb-2">{app.companyName}</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${app.status === 'Reviewing' ? 'bg-amber-400' : 'bg-green-400'}`} />
                    <span className="text-[11px] font-medium text-slate-600">{app.status}</span>
                  </div>
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <div className="text-center py-10">
                <Briefcase className="mx-auto text-slate-200 mb-3" size={40} />
                <p className="text-slate-400 text-sm">No recent activity found.</p>
              </div>
            )}
          </div>
          <button className="w-full mt-8 py-2.5 text-indigo-600 text-sm font-bold border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
