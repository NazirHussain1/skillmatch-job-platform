export const JOB_TYPE_LABELS = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  remote: 'Remote',
  internship: 'Internship',
  contract: 'Contract'
};

export const WORKPLACE_TYPE_LABELS = {
  'on-site': 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote'
};

export const EXPERIENCE_LEVEL_LABELS = {
  entry: 'Entry level',
  mid: 'Mid level',
  senior: 'Senior level',
  lead: 'Lead',
  executive: 'Executive'
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);

export const formatSalaryRange = (job = {}) => {
  const min = Number(job.salaryMin);
  const max = Number(job.salaryMax);

  if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > 0 && min !== max) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }

  const salary = Number.isFinite(max) && max > 0 ? max : Number(job.salary);

  if (Number.isFinite(salary) && salary > 0) {
    return formatCurrency(salary);
  }

  return 'Salary not listed';
};

export const formatDeadline = (dateString) => {
  if (!dateString) {
    return 'No deadline listed';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateString));
};
