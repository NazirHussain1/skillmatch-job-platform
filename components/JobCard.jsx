
import React from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
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



const JobCard = React.memo(({ job, user, onApply }) => {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [matchResult, setMatchResult] = React.useState(null);

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
    <LazyMotion features={domAnimation}>
      <m.div
      initial={{ opacity) 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' 
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'}
              `}
            >
              {skill}
            </span>
          ))}
        </div>

        {matchResult && (
          <div className="mb-6 p-4 bg-gradient-to-br from-primary-50 to-purple-50 border border-primary-100 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-primary-900">AI Match Score</span>
              <span className={`text-sm font-black ${matchResult.score > 80 ? 'text-green-600' ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSmartMatch}
            disabled={isAnalyzing}
            className="btn-outline flex-1"
          >
            {isAnalyzing ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Sparkles size={18} />
                <span>Smart Match</span>
              </>
            )}
          </m.button>
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApply}
            className="btn-primary flex-1"
          >
            <span>Apply Now</span>
            <ArrowRight size={18} />
          </m.button>
        </div>
      </div>
    </m.div>
    </LazyMotion>
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


