import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getSavedJobs, unsaveJob } from '../features/user/userSlice';
import { Briefcase, MapPin, DollarSign, Bookmark, BookmarkCheck } from 'lucide-react';

function SavedJobs() {
  const dispatch = useDispatch();
  const { savedJobs, isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getSavedJobs());
  }, [dispatch]);

  const handleUnsave = async (jobId) => {
    try {
      await dispatch(unsaveJob(jobId)).unwrap();
      toast.success('Job removed from saved');
    } catch (error) {
      toast.error(error || 'Failed to remove job');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-600 mt-1">Your bookmarked job opportunities</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <div key={job._id} className="card hover-lift relative">
              <button
                onClick={() => handleUnsave(job._id)}
                className="absolute top-4 right-4 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Remove from saved"
              >
                <BookmarkCheck className="w-5 h-5 fill-current" />
              </button>

              <h3 className="text-xl font-semibold text-gray-900 mb-2 pr-10">{job.title}</h3>
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
              
              {job.employer && (
                <p className="text-xs text-gray-500">
                  Posted by: {job.employer.companyName || job.employer.name}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
          <p className="text-gray-600">Start bookmarking jobs you're interested in</p>
        </div>
      )}
    </div>
  );
}

export default SavedJobs;
