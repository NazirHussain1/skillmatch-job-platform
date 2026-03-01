import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { UserRole, Application, Job } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, Briefcase, CheckCircle, ArrowUpRight, Clock } from 'lucide-react';

// Loading Skeleton Components
const StatCardSkeleton = () => (
  <div className="card bg-white p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-16"></div>
  </div>
);

const ChartSkeleton = () => (
  <div className="card bg-white p-6 sm:p-8 animate-pulse">
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
    <div className="h-64 bg-gray-100 rounded-xl"></div>
  </div>
);

const ActivitySkeleton = () => (
  <div className="card bg-white p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [appsData, jobsData] = await Promise.all([
          apiService.getApplications(user.id),
          apiService.getJobs()
        ]);
        setApplications(appsData);
        setJobs(jobsData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (!user) return null;

  const chartData = [
    { name: 'Jan', value: 4 },
    { name: 'Feb', value: 7 },
    { name: 'Mar', value: 5 },
    { name: 'Apr', value: 12 },
    { name: 'May', value: 9 },
    { name: 'Jun', value: 15 },
  ];

  const seekerStats = [
    { 
      label: 'Applied Jobs', 
      value: applications.length, 
      change: '+12%',
      icon: Briefcase, 
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    { 
      label: 'Interviews', 
      value: 2, 
      change: '+8%',
      icon: Users, 
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    { 
      label: 'Offers', 
      value: 1, 
      change: '+25%',
      icon: CheckCircle, 
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100'
    },
    { 
      label: 'Profile Views', 
      value: '42', 
      change: '+18%',
      icon: TrendingUp, 
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100'
    },
  ];

  const employerStats = [
    { 
      label: 'Active Postings', 
      value: jobs.length, 
      change: '+5%',
      icon: Briefcase, 
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    { 
      label: 'New Applicants', 
      value: 18, 
      change: '+23%',
      icon: Users, 
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    { 
      label: 'Hired', 
      value: 3, 
      change: '+15%',
      icon: CheckCircle, 
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100'
    },
    { 
      label: 'Matches Found', 
      value: '124', 
      change: '+32%',
      icon: TrendingUp, 
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100'
    },
  ];

  const stats = user.role === UserRole.JOB_SEEKER ? seekerStats : employerStats;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Updated 5 min ago</span>
        </div>
      </div>

      {/* Stats Grid - 4 Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="group card bg-white p-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon and Change Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.bgGradient} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-5 h-5 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>

              {/* Label and Value */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        {loading ? (
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
        ) : (
          <div className="lg:col-span-2 card bg-white p-6 sm:p-8">
            {/* Chart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Activity Overview</h2>
                <p className="text-sm text-gray-500 mt-1">Your performance over time</p>
              </div>
              <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100 cursor-pointer">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
                <option>All time</option>
              </select>
            </div>

            {/* Chart */}
            <div className="h-72 w-full">
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
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 8 }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
                      padding: '12px'
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === chartData.length - 1 ? 'url(#colorGradient)' : '#e2e8f0'} 
                      />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Activity Sidebar */}
        {loading ? (
          <ActivitySkeleton />
        ) : (
          <div className="card bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
            
            <div className="space-y-4">
              {(user.role === UserRole.JOB_SEEKER ? applications : []).slice(0, 5).map((app, index) => (
                <div 
                  key={app.id} 
                  className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-600">
                      {app.companyName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{app.jobTitle}</p>
                    <p className="text-xs text-gray-500 mb-1.5">{app.companyName}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        app.status === 'Accepted' ? 'bg-green-500' :
                        app.status === 'Reviewing' ? 'bg-yellow-500' :
                        app.status === 'Interviewing' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`} />
                      <span className="text-xs font-medium text-gray-600">{app.status}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {applications.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No recent activity</p>
                  <p className="text-xs text-gray-400 mt-1">Your activity will appear here</p>
                </div>
              )}
            </div>

            {applications.length > 0 && (
              <button className="w-full mt-6 py-2.5 text-sm font-semibold text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                View All Activity
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
