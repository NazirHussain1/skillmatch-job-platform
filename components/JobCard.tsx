
import React from 'react';
import { Job, User, MatchResult } from '../types';
import { calculateSkillMatch } from '../services/matchingService';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  user: User;
  onApply: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, user, onApply }) => {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [matchResult, setMatchResult] = React.useState<MatchResult | null>(null);

  const handleSmartMatch = async () => {
    setIsAnalyzing(true);
    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = calculateSkillMatch(user, job);
    setMatchResult(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-indigo-200 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-slate-600 font-medium">{job.companyName}</p>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
          {job.type}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <MapPin size={16} />
          {job.location}
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <DollarSign size={16} />
          {job.salary}
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Clock size={16} />
          {job.postedAt}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {job.requiredSkills.map(skill => (
          <span 
            key={skill} 
            className={`
              px-2 py-1 rounded-md text-xs font-medium
              ${user.skills.includes(skill) 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-slate-50 text-slate-600 border border-slate-200'}
            `}
          >
            {skill}
          </span>
        ))}
      </div>

      {matchResult && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-indigo-900">AI Match Score</span>
            <span className={`text-sm font-black ${matchResult.score > 80 ? 'text-green-600' : 'text-indigo-600'}`}>
              {matchResult.score}%
            </span>
          </div>
          <div className="w-full bg-indigo-200 h-1.5 rounded-full mb-3">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-1000" 
              style={{ width: `${matchResult.score}%` }}
            />
          </div>
          <p className="text-xs text-indigo-800 leading-relaxed italic">
            "{matchResult.reasoning}"
          </p>
          {matchResult.missingSkills.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Potential Upskill Needs</p>
              <div className="flex flex-wrap gap-1">
                {matchResult.missingSkills.map(s => (
                  <span key={s} className="text-[10px] bg-white/50 px-1.5 py-0.5 rounded text-indigo-600">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSmartMatch}
          disabled={isAnalyzing}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Sparkles size={18} />
              Smart Match
            </>
          )}
        </button>
        <button
          onClick={() => onApply(job.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
        >
          Apply Now
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default JobCard;
