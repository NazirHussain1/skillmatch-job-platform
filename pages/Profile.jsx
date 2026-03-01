
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Plus, X, Save, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    companyName: user?.companyName || '',
  });

  if (!user) return null;

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateUser(formData);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 mb-8">
          <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
          <span className="text-green-700">{message}</span>
        </div>
      )}

      <div className="card bg-white overflow-hidden">
        <div className="h-32 bg-primary-600 relative">
          <div className="absolute -bottom-12 left-4 sm:left-8">
            <img 
              src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}`}
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-white"
              alt="Profile"
            />
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{formData.name}</h1>
            <p className="text-gray-500">{user.role === UserRole.EMPLOYER ? formData.companyName : 'Software Developer'}</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="p-4 sm:p-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-primary-600" size={20} />
              Basic Information
            </h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
              />
            </div>

            {user.role === UserRole.EMPLOYER && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                <input 
                  type="text" 
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea 
                rows={4}
                value={formData.bio || ''}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plus className="text-primary-600" size={20} />
              Skills & Expertise
            </h3>

            <form onSubmit={addSkill} className="flex gap-2">
              <input 
                type="text" 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g. Docker)"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
              />
              <button 
                type="submit"
                className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <Plus size={20} />
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <div 
                  key={skill} 
                  className="group flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 text-primary-700 rounded-lg text-sm font-medium transition-all duration-200 hover:border-primary-300"
                >
                  {skill}
                  <button 
                    onClick={() => removeSkill(skill)}
                    className="p-0.5 hover:bg-primary-100 rounded-full text-primary-400 group-hover:text-primary-600 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-sm text-gray-400 italic">No skills added yet.</p>
              )}
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                SkillMatch AI uses these skills to calculate your compatibility score with job postings. Keep them up to date to improve your matching results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
