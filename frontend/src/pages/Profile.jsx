import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Mail, Briefcase, Calendar, MapPin, Edit2, Save, X, Plus, Trash2, Camera, FileText, Upload } from 'lucide-react';
import { getUserProfile, updateUserProfile, reset, uploadResume } from '../features/user/userSlice';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { getOptimizedCloudinaryUrl } from '../utils/cloudinary';

function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, isLoading, isSuccess, isError, message } = useSelector((state) => state.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    skills: [],
    location: '',
    profilePicture: '',
    experience: [],
    education: [],
    // Employer fields
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    companyLogo: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        location: profile.location || '',
        profilePicture: profile.profilePicture || '',
        experience: profile.experience || [],
        education: profile.education || [],
        // Employer fields
        companyName: profile.companyName || '',
        companyWebsite: profile.companyWebsite || '',
        companyDescription: profile.companyDescription || '',
        companyLogo: profile.companyLogo || '',
      });
      setImagePreview(profile.profilePicture || '');
      setLogoPreview(profile.companyLogo || '');
    }
  }, [profile]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && isEditing) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    }

    dispatch(reset());
  }, [isError, isSuccess, message, isEditing, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleAddExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        {
          title: '',
          company: '',
          location: '',
          from: '',
          to: '',
          current: false,
          description: '',
        },
      ],
    });
  };

  const handleRemoveExperience = (index) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index),
    });
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index][field] = value;
    setFormData({
      ...formData,
      experience: updatedExperience,
    });
  };

  const handleAddEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          school: '',
          degree: '',
          fieldOfStudy: '',
          from: '',
          to: '',
          current: false,
          description: '',
        },
      ],
    });
  };

  const handleRemoveEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][field] = value;
    setFormData({
      ...formData,
      education: updatedEducation,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      toast.error('Please select an image first');
      return;
    }

    const formDataImage = new FormData();
    formDataImage.append('profilePicture', imageFile);

    setUploadingImage(true);
    try {
      const response = await api.post('/users/profile/picture', formDataImage, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Profile picture updated successfully');
      setFormData({
        ...formData,
        profilePicture: response.data.data.profilePicture,
      });
      setImageFile(null);
      dispatch(getUserProfile());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast.error('Please select a logo first');
      return;
    }

    const formDataLogo = new FormData();
    formDataLogo.append('companyLogo', logoFile);

    setUploadingLogo(true);
    try {
      const response = await api.post('/users/profile/company-logo', formDataLogo, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Company logo updated successfully');
      setFormData({
        ...formData,
        companyLogo: response.data.data.companyLogo,
      });
      setLogoFile(null);
      dispatch(getUserProfile());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Resume size should be less than 10MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a PDF, DOC, or DOCX file');
        return;
      }

      setResumeFile(file);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume first');
      return;
    }

    setUploadingResume(true);
    try {
      await dispatch(uploadResume(resumeFile)).unwrap();
      toast.success('Resume uploaded successfully');
      setResumeFile(null);
      dispatch(getUserProfile());
    } catch (error) {
      toast.error(error || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(formData));
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        location: profile.location || '',
        profilePicture: profile.profilePicture || '',
        experience: profile.experience || [],
        education: profile.education || [],
        // Employer fields
        companyName: profile.companyName || '',
        companyWebsite: profile.companyWebsite || '',
        companyDescription: profile.companyDescription || '',
        companyLogo: profile.companyLogo || '',
      });
      setImagePreview(profile.profilePicture || '');
      setImageFile(null);
      setLogoPreview(profile.companyLogo || '');
      setLogoFile(null);
    }
    setIsEditing(false);
  };

  if (isLoading && !profile) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {imagePreview || formData.profilePicture ? (
                <img
                  src={getOptimizedCloudinaryUrl(imagePreview || formData.profilePicture, {
                    width: 160,
                    height: 160,
                    crop: 'fill',
                    gravity: 'face'
                  })}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {formData.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field text-xl font-bold"
                    placeholder="Your Name"
                  />
                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleUploadImage}
                      disabled={uploadingImage}
                      className="btn-secondary text-sm"
                    >
                      {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
                  <p className="text-gray-600 capitalize">{user?.role}</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="your@email.com"
                  />
                ) : (
                  <p className="font-medium text-gray-900">{profile?.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Location</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="City, Country"
                  />
                ) : (
                  <p className="font-medium text-gray-900">{profile?.location || 'Not specified'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Briefcase className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-gray-700">{profile?.bio || 'No bio added yet.'}</p>
          )}
        </div>

        {/* Employer Company Information */}
        {user?.role === 'employer' && (
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Company Information</h3>
            
            {/* Company Logo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <div className="flex items-center gap-4">
                {logoPreview || formData.companyLogo ? (
                  <img
                    src={getOptimizedCloudinaryUrl(logoPreview || formData.companyLogo, {
                      width: 192,
                      height: 192,
                      crop: 'fit'
                    })}
                    alt="Company Logo"
                    className="w-24 h-24 rounded-lg object-contain border border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                {isEditing && (
                  <div className="flex-1">
                    <label className="btn-secondary cursor-pointer inline-block">
                      <Camera className="w-4 h-4 inline mr-2" />
                      Choose Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                    {logoFile && (
                      <button
                        type="button"
                        onClick={handleUploadLogo}
                        disabled={uploadingLogo}
                        className="btn-primary ml-2"
                      >
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your Company Name"
                  />
                ) : (
                  <p className="text-gray-700">{profile?.companyName || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://www.example.com"
                  />
                ) : (
                  profile?.companyWebsite ? (
                    <a
                      href={profile.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {profile.companyWebsite}
                    </a>
                  ) : (
                    <p className="text-gray-700">Not specified</p>
                  )
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description
                </label>
                {isEditing ? (
                  <textarea
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleChange}
                    rows="4"
                    className="input-field"
                    placeholder="Tell us about your company..."
                  />
                ) : (
                  <p className="text-gray-700">{profile?.companyDescription || 'No description added yet.'}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resume Upload Section (Jobseeker only) */}
        {user?.role === 'jobseeker' && (
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Resume</h3>
            
            <div className="space-y-4">
              {profile?.resume && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Current Resume</p>
                      <a
                        href={profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        View Resume
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Resume (PDF, DOC, DOCX)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="btn-secondary cursor-pointer flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </label>
                  {resumeFile && (
                    <>
                      <span className="text-sm text-gray-600">{resumeFile.name}</span>
                      <button
                        type="button"
                        onClick={handleUploadResume}
                        disabled={uploadingResume}
                        className="btn-primary"
                      >
                        {uploadingResume ? 'Uploading...' : 'Upload'}
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Skills Section */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-primary-700 hover:text-primary-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {formData.skills.length === 0 && !isEditing && (
              <p className="text-gray-500">No skills added yet.</p>
            )}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="input-field flex-1"
                placeholder="Add a skill"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Experience Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Experience</h3>
            {isEditing && (
              <button
                type="button"
                onClick={handleAddExperience}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Experience
              </button>
            )}
          </div>
          <div className="space-y-4">
            {formData.experience.map((exp, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                        className="input-field flex-1"
                        placeholder="Job Title"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                      className="input-field"
                      placeholder="Company"
                    />
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                      className="input-field"
                      placeholder="Location"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={exp.from ? new Date(exp.from).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleExperienceChange(index, 'from', e.target.value)}
                        className="input-field"
                      />
                      <input
                        type="date"
                        value={exp.to ? new Date(exp.to).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleExperienceChange(index, 'to', e.target.value)}
                        className="input-field"
                        disabled={exp.current}
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Currently working here</span>
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      rows="3"
                      className="input-field"
                      placeholder="Description"
                    />
                  </div>
                ) : (
                  <>
                    <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                    <p className="text-gray-700">{exp.company}</p>
                    <p className="text-sm text-gray-600">{exp.location}</p>
                    <p className="text-sm text-gray-600">
                      {exp.from ? new Date(exp.from).toLocaleDateString() : ''} - {exp.current ? 'Present' : exp.to ? new Date(exp.to).toLocaleDateString() : ''}
                    </p>
                    {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                  </>
                )}
              </div>
            ))}
            {formData.experience.length === 0 && !isEditing && (
              <p className="text-gray-500">No experience added yet.</p>
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Education</h3>
            {isEditing && (
              <button
                type="button"
                onClick={handleAddEducation}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Education
              </button>
            )}
          </div>
          <div className="space-y-4">
            {formData.education.map((edu, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                        className="input-field flex-1"
                        placeholder="School/University"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className="input-field"
                      placeholder="Degree"
                    />
                    <input
                      type="text"
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                      className="input-field"
                      placeholder="Field of Study"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={edu.from ? new Date(edu.from).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleEducationChange(index, 'from', e.target.value)}
                        className="input-field"
                      />
                      <input
                        type="date"
                        value={edu.to ? new Date(edu.to).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleEducationChange(index, 'to', e.target.value)}
                        className="input-field"
                        disabled={edu.current}
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={edu.current}
                        onChange={(e) => handleEducationChange(index, 'current', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Currently studying here</span>
                    </label>
                    <textarea
                      value={edu.description}
                      onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                      rows="3"
                      className="input-field"
                      placeholder="Description"
                    />
                  </div>
                ) : (
                  <>
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-gray-700">{edu.school}</p>
                    <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                    <p className="text-sm text-gray-600">
                      {edu.from ? new Date(edu.from).toLocaleDateString() : ''} - {edu.current ? 'Present' : edu.to ? new Date(edu.to).toLocaleDateString() : ''}
                    </p>
                    {edu.description && <p className="text-gray-700 mt-2">{edu.description}</p>}
                  </>
                )}
              </div>
            ))}
            {formData.education.length === 0 && !isEditing && (
              <p className="text-gray-500">No education added yet.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default Profile;
