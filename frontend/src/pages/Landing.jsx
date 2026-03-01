import { Link } from 'react-router-dom';
import { Briefcase, Users, TrendingUp } from 'lucide-react';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      {/* Header */}
      <header className="container-custom py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">SkillMatch</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container-custom py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Dream Job
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
              Match Your Skills
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with top employers and discover opportunities that match your skills and experience.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Start Your Journey
            </Link>
            <Link to="/login" className="btn-outline text-lg px-8 py-4">
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Browse Jobs</h3>
            <p className="text-gray-600">
              Explore thousands of job opportunities from top companies
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Apply</h3>
            <p className="text-gray-600">
              Apply to jobs with one click and track your applications
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Hired</h3>
            <p className="text-gray-600">
              Connect with employers and land your dream job faster
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Landing;
