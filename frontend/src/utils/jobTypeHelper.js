// Helper function to format job type display text
export const formatJobType = (jobType) => {
  const jobTypeMap = {
    'full-time': 'Full Time',
    'part-time': 'Part Time',
    'remote': 'Remote',
    'internship': 'Internship',
    'contract': 'Contract'
  };
  
  return jobTypeMap[jobType] || jobType;
};

// Job Type Badge Component (can be used inline)
export const getJobTypeBadge = (jobType) => {
  if (!jobType) return null;
  
  return (
    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
      {formatJobType(jobType)}
    </span>
  );
};
