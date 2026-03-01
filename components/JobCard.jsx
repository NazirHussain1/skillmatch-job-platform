
import React from 'react';
import { motion } from 'framer-motion';
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

const JobCard: React.FC<JobCardProps> = React.memo(({ job, user, onApply }) => {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [matchResult, setMatchResult] = React.useState<MatchResult | null>(null);

  const handleSmartMatch = React.useCallback(async () => {
    setIsAnalyzing(true);
    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = calculateSkillMatch(user, job);
    setMatchResult(result);
    setIsAnalyzing(false);
  }, [user, job]);

  const handleApply = React.useCallback(() => {
    onApply(job.id);
  }, [onApply, job.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      transition={{ duration: 0.3 }}
      className="card bg-white p-6 hover:border-primary-200 transition-all duration-300 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-gray-600 font-medium">{job.companyName}</p>
        </div>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
          {job.type}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MapPin size={16} />
          {job.location}
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <DollarSign size={16} />
          {job.salary}
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
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
                : 'bg-gray-50 text-gray-600 border border-gray-200'}
            `}
          >
            {skill}
          </span>
        ))}
      </div>

      {matchResult && (
        <div className="mb-6 p-4 bg-primary-50 border border-primary-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-primary-900">AI Match Score</span>
            <span className={`text-sm font-black ${matchResult.score > 80 ? 'text-green-600' : 'text-primary-600'}`}>
              {matchResult.score}%
            </span>
          </div>
          <div className="w-full bg-primary-200 h-1.5 rounded-full mb-3">
            <div 
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-1000" 
              style={{ width: `${matchResult.score}%` }}
            />
          </div>
          <p className="text-xs text-primary-800 leading-relaxed italic">
            "{matchResult.reasoning}"
          </p>
          {matchResult.missingSkills.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-primary-400 mb-1">Potential Upskill Needs</p>
              <div className="flex flex-wrap gap-1">
                {matchResult.missingSkills.map(s => (
                  <span key={s} className="text-[10px] bg-white/50 px-1.5 py-0.5 rounded text-primary-600">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSmartMatch}
          disabled={isAnalyzing}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {isAnalyzing ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Sparkles size={18} />
              Smart Match
            </>
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleApply}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Apply Now
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.job.id === nextProps.job.id &&
    prevProps.user.id === nextProps.user.id &&
    prevProps.onApply === nextProps.onApply
  );
});

JobCard.displayName = 'JobCard';

export default JobCard;
