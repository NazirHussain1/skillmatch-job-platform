import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Briefcase, Users, TrendingUp, Search, MapPin, Building, CheckCircle } from 'lucide-react';
import jobService from '../services/jobService';

function Landing() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const data = await jobService.getJobs({ limit: 6, status: 'active' });
        setFeaturedJobs(data.jobs || []);
      } catch {
        setFeaturedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to jobs page with search params
    const params = new URLSearchParams();
    if (searchKeyword) params.append('keyword', searchKeyword);
    if (searchLocation) params.append('location', searchLocation);
    window.location.href = `/jobs?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SkillMatch
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Dream Job
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Match Your Skills
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Connect with top employers and discover opportunities that match your skills and experience. Join thousands of professionals who found their perfect career match.
          </p>

          {/* Job Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="flex-1 outline-none text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 px-4 py-3 border-t md:border-t-0 md:border-l border-gray-200">
                <MapPin className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="flex-1 outline-none text-gray-900 placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="btn-primary px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                <Search className="w-5 h-5" />
                Search Jobs
              </button>
            </div>
          </form>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Trusted by 10,000+ users
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              5,000+ active jobs
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              500+ companies
            </span>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Jobs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover top opportunities from leading companies. These jobs are hand-picked for their quality and growth potential.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.slice(0, 6).map((job) => (
                <Link
                  key={job._id}
                  to="/jobs"
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.company?.name || 'Company'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      {job.jobType}
                    </div>
                    {job.salary && (
                      <div className="text-sm font-medium text-green-600">
                        ${job.salary.toLocaleString()}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/jobs" className="btn-outline">
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Companies Hiring</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join industry leaders and innovative companies that are actively hiring top talent.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: 'TechCorp', logo: 'T' },
              { name: 'InnovateLab', logo: 'I' },
              { name: 'DataFlow', logo: 'D' },
              { name: 'CloudSync', logo: 'C' },
              { name: 'AI Solutions', logo: 'A' },
              { name: 'WebWorks', logo: 'W' }
            ].map((company, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">{company.logo}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{company.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Jobs Posted</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Companies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Find Your Next Opportunity?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of professionals who have found their dream jobs through SkillMatch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary px-8 py-4 text-lg">
              Create Free Account
            </Link>
            <Link to="/jobs" className="btn-outline px-8 py-4 text-lg">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
