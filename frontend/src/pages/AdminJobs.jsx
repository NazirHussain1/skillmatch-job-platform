import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getAllJobs, deleteJob } from '../features/admin/adminSlice';
import { Briefcase, MapPin, DollarSign, Trash2, X, Building2 } from 'lucide-react';
import Pagination from '../components/Pagination';

function AdminJobs() {
  const dispatch = useDispatch();
  const { jobs, jobsPagination, isLoading } = useSelector((state) => state.admin);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getAllJobs({ page, limit: 9 }));
  }, [dispatch, page]);

  const handleDelete = (job) => {
    setSelectedJob(job);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteJob(selectedJob._id)).unwrap();
      toast.success('Job deleted successfully!');
      setShowDeleteModal(false);
      setSelectedJob(null);
    } catch (error) {
      toast.error(error || 'Failed to delete job');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
        <p className="text-gray-600 mt-1">Manage all job postings on the platform</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : jobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="card hover-lift">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                  <button
                    onClick={() => handleDelete(job)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-2">{job.company}</p>
                
                {job.employer && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Building2 className="w-4 h-4" />
                    <span>Posted by: {job.employer.name}</span>
                  </div>
                )}
                
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
                
                <div className="text-xs text-gray-500">
                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={jobsPagination.page}
            totalPages={jobsPagination.pages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">No jobs have been posted yet</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-red-600">Delete Job</h2>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone and will remove all associated applications.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminJobs;
