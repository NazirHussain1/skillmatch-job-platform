const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  if (type === 'card') {
    return (
      <>
        {[...Array(count)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="animate-pulse space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              
              {/* Badges */}
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
              </div>
              
              {/* Details */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }
  
  if (type === 'list') {
    return (
      <>
        {[...Array(count)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="animate-pulse flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }
  
  if (type === 'stat') {
    return (
      <>
        {[...Array(count)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </>
    );
  }
  
  return null;
};

export default SkeletonLoader;
