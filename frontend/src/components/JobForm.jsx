import { useState, useEffect } from 'react';

const JobForm = ({ initialData = {}, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    jobType: 'full-time',
    workplaceType: 'on-site',
    experienceLevel: 'mid',
    category: '',
    skillsText: '',
    benefitsText: '',
    applicationDeadline: '',
    isUrgent: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || '',
        company: initialData.company || '',
        description: initialData.description || '',
        location: initialData.location || '',
        salaryMin: initialData.salaryMin || initialData.salary || '',
        salaryMax: initialData.salaryMax || initialData.salary || '',
        jobType: initialData.jobType || 'full-time',
        workplaceType: initialData.workplaceType || (initialData.jobType === 'remote' ? 'remote' : 'on-site'),
        experienceLevel: initialData.experienceLevel || 'mid',
        category: initialData.category || '',
        skillsText: Array.isArray(initialData.skills) ? initialData.skills.join(', ') : '',
        benefitsText: Array.isArray(initialData.benefits) ? initialData.benefits.join(', ') : '',
        applicationDeadline: initialData.applicationDeadline ? initialData.applicationDeadline.slice(0, 10) : '',
        isUrgent: Boolean(initialData.isUrgent)
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.salaryMin) {
      newErrors.salaryMin = 'Minimum salary is required';
    } else if (isNaN(formData.salaryMin) || Number(formData.salaryMin) <= 0) {
      newErrors.salaryMin = 'Minimum salary must be positive';
    }

    if (!formData.salaryMax) {
      newErrors.salaryMax = 'Maximum salary is required';
    } else if (isNaN(formData.salaryMax) || Number(formData.salaryMax) <= 0) {
      newErrors.salaryMax = 'Maximum salary must be positive';
    } else if (Number(formData.salaryMax) < Number(formData.salaryMin)) {
      newErrors.salaryMax = 'Maximum salary must be greater than minimum salary';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (
      formData.applicationDeadline &&
      new Date(`${formData.applicationDeadline}T23:59:59`).getTime() < Date.now()
    ) {
      newErrors.applicationDeadline = 'Deadline must be today or later';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      const skills = formData.skillsText
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
      const benefits = formData.benefitsText
        .split(',')
        .map((benefit) => benefit.trim())
        .filter(Boolean);
      const salaryMin = Number(formData.salaryMin);
      const salaryMax = Number(formData.salaryMax);

      onSubmit({
        title: formData.title.trim(),
        company: formData.company.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        salary: salaryMax || salaryMin,
        salaryMin,
        salaryMax,
        jobType: formData.jobType,
        workplaceType: formData.workplaceType,
        experienceLevel: formData.experienceLevel,
        category: formData.category,
        skills,
        benefits,
        applicationDeadline: formData.applicationDeadline || '',
        isUrgent: formData.isUrgent
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.company.trim() &&
      formData.description.trim() &&
      formData.location.trim() &&
      formData.salaryMin &&
      formData.salaryMax &&
      !isNaN(formData.salaryMin) &&
      !isNaN(formData.salaryMax) &&
      Number(formData.salaryMin) > 0 &&
      Number(formData.salaryMax) >= Number(formData.salaryMin) &&
      formData.category
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g. Senior Software Engineer"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
          Company <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.company ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g. Tech Corp"
        />
        {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe the job role, responsibilities, and requirements..."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.location ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g. New York, NY"
        />
        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Salary <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="salaryMin"
            name="salaryMin"
            value={formData.salaryMin}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.salaryMin ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g. 70000"
            min="0"
          />
          {errors.salaryMin && <p className="text-red-500 text-sm mt-1">{errors.salaryMin}</p>}
        </div>
        <div>
          <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Salary <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="salaryMax"
            name="salaryMax"
            value={formData.salaryMax}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.salaryMax ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g. 95000"
            min="0"
          />
          {errors.salaryMax && <p className="text-red-500 text-sm mt-1">{errors.salaryMax}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
            Job Type <span className="text-red-500">*</span>
          </label>
          <select
            id="jobType"
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="remote">Remote</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        <div>
          <label htmlFor="workplaceType" className="block text-sm font-medium text-gray-700 mb-1">
            Workplace
          </label>
          <select
            id="workplaceType"
            name="workplaceType"
            value={formData.workplaceType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="on-site">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </div>
        <div>
          <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
            Experience
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="entry">Entry level</option>
            <option value="mid">Mid level</option>
            <option value="senior">Senior level</option>
            <option value="lead">Lead</option>
            <option value="executive">Executive</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a category</option>
          <option value="Software Development">Software Development</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="Customer Support">Customer Support</option>
          <option value="Finance">Finance</option>
          <option value="HR">HR</option>
          <option value="Other">Other</option>
        </select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>

      <div>
        <label htmlFor="skillsText" className="block text-sm font-medium text-gray-700 mb-1">
          Skills
        </label>
        <input
          type="text"
          id="skillsText"
          name="skillsText"
          value={formData.skillsText}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="React, Node.js, MongoDB"
        />
      </div>

      <div>
        <label htmlFor="benefitsText" className="block text-sm font-medium text-gray-700 mb-1">
          Benefits
        </label>
        <input
          type="text"
          id="benefitsText"
          name="benefitsText"
          value={formData.benefitsText}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Health insurance, Paid time off, Learning budget"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
            Application Deadline
          </label>
          <input
            type="date"
            id="applicationDeadline"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.applicationDeadline ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.applicationDeadline && <p className="text-red-500 text-sm mt-1">{errors.applicationDeadline}</p>}
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            name="isUrgent"
            checked={formData.isUrgent}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Mark as urgent hiring
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            !isFormValid() || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default JobForm;
