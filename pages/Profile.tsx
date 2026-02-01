
import React from 'react';
import { User, UserRole } from '../types';
import { Plus, X, Save, ShieldCheck } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = React.useState<User>(user);
  const [newSkill, setNewSkill] = React.useState('');

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-indigo-600 relative">
          <div className="absolute -bottom-12 left-8">
            <img 
              src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}`}
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-white"
              alt="Profile"
            />
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{formData.name}</h1>
            <p className="text-slate-500">{formData.role === UserRole.EMPLOYER ? formData.companyName : 'Software Developer'}</p>
          </div>
          <button 
            onClick={() => onUpdate(formData)}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>

        <div className="p-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={20} />
              Basic Information
            </h3>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {user.role === UserRole.EMPLOYER && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                <input 
                  type="text" 
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
              <textarea 
                rows={4}
                value={formData.bio || ''}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus className="text-indigo-600" size={20} />
              Skills & Expertise
            </h3>

            <form onSubmit={addSkill} className="flex gap-2">
              <input 
                type="text" 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g. Docker)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button 
                type="submit"
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all"
              >
                <Plus size={20} />
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <div 
                  key={skill} 
                  className="group flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-all hover:border-indigo-300"
                >
                  {skill}
                  <button 
                    onClick={() => removeSkill(skill)}
                    className="p-0.5 hover:bg-indigo-100 rounded-full text-indigo-400 group-hover:text-indigo-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-sm text-slate-400 italic">No skills added yet.</p>
              )}
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                SkillMatch AI uses these skills to calculate your compatibility score with job postings. Keep them up to date to improve your matching results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
