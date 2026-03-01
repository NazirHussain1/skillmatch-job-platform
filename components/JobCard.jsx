
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
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden card bg-white p-6 hover:shadow-2xl transition-all duration-300"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300 mb-1">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium">{job.companyName}</p>
          </div>
          <span className="px-3 py-1.5 bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 rounded-full text-xs font-semibold shadow-sm">
            {job.type}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin size={16} className="flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <DollarSign size={16} className="flex-shrink-0" />
            <span className="truncate">{job.salary}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm col-span-2">
            <Clock size={16} className="flex-shrink-0" />
            <span>{job.postedAt}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {job.requiredSkills.map(skill => (
            <span 
              key={skill} 
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${user.skills.includes(skill) 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 shadow-sm' 
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'}
              `}
            >
              {skill}
            </span>
          ))}
        </div>

        {matchResult && (
          <div className="mb-6 p-4 bg-gradient-to-br from-primary-50 to-purple-50 border border-primary-100 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-primary-900">AI Match Score</span>
              <span className={`text-sm font-black ${matchResult.score > 80 ? 'text-green-600' : 'text-primary-600'}`}>
                {matchResult.score}%
              </span>
            </div>
            <div className="w-full bg-primary-200 h-2 rounded-full mb-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${matchResult.score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-primary-600 to-purple-600 h-2 rounded-full shadow-sm"
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
                    <span key={s} className="text-[10px] bg-white/60 px-2 py-1 rounded-md text-primary-600 font-medium">
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
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
          >
            {isAnalyzing ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Sparkles size={18} />
                <span>Smart Match</span>
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApply}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold hover:from-primary-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-md hover:shadow-xl"
          >
            <span>Apply Now</span>
            <ArrowRight size={18} />
          </motion.button>
        </div>
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
