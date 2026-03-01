import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getJobs, createJob } from '../features/jobs/jobSlice';
import { createApplication } from '../features/applications/applicationSlice';
import { Briefcase, MapPin, DollarSign, Plus, X } from 'lucide-react';

function Jobs() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { jobs, isLoading } = useSelector((state) => state.jobs);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salary: '',
  });

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createJob({ ...formData, salary: Number(formData.salary) })).unwrap();
      toast.success('Job posted successfully!');
      setShowModal(false);
      setFormData({ title: '', company: '', description: '', location: '', salary: '' });
    } catch (error) {
      toast.error(error || 'Failed to post job');
    }
  };

  const handleApply = async (jobId) => {
    try {
      await dispatch(createApplication(jobId)).unwrap();
      toast.success('Application submitted!');
    } catch (error) {
      toast.error(error || 'Failed to apply');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="text-gray-600 mt-1">Find your next opportunity</p>
        </div>
        {user?.role === 'employer' && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-5 h-5" />
            Post Job
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map((job) => (
            <div key={job._id} className="card hover-lift">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-4">{job.company}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">${job.salary?.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>
              {user?.role === 'jobseeker' && (
                <button
                  onClick={() => handleApply(job._id)}
                  className="btn-primary w-full"
                >
                  Apply Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Post a Job</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="input"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows="3"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                required
              />
              <input
                type="number"
                placeholder="Salary"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="input"
                required
              />
              <button type="submit" className="btn-primary w-full">
                Post Job
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;
