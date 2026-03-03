import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Briefcase, Calendar, MapPin, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { getUserProfile, updateUserProfile, reset } from '../features/user/userSlice';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

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
  });

  const [newSkill, setNewSkill] = useState('');

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
      });
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
      });
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
            <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {formData.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field text-xl font-bold"
                  placeholder="Your Name"
                />
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
