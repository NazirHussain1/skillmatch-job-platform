import Job from '../jobs/job.model.js';
import User from '../users/user.model.js';
import Application from '../applications/application.model.js';
import { 
  MATCHING_CONSTANTS, 
  RELATED_SKILLS, 
  ExperienceLevel
} from '../../config/app.constants.js';

interface SkillGapResult {
  matchScore: number;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  totalRequired: number;
  experienceMatch: boolean;
}

interface JobRecommendation {
  _id: any;
  title: string;
  companyName: string;
  location: string;
  salary: string;
  type: string;
  experienceLevel: string;
  description: string;
  requiredSkills: string[];
  isActive: boolean;
  matchScore: number;
  [key: string]: any;
}

interface CandidateRecommendation {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  skills: string[];
  experienceLevel: string;
  bio?: string | null;
  matchScore: number;
}

class MatchingService {
  private readonly WEIGHTS = MATCHING_CONSTANTS.WEIGHTS;
  private readonly EXPERIENCE_MULTIPLIERS = MATCHING_CONSTANTS.EXPERIENCE_MULTIPLIERS;
  private readonly RELATED_SKILLS_MAP = RELATED_SKILLS;

  /**
   * Calculate skill match score between user skills and required skills
   */
  calculateSkillScore(userSkills: string[], requiredSkills: string[]): number {
    if (!requiredSkills || requiredSkills.length === 0) {
      return 50;
    }

    if (!userSkills || userSkills.length === 0) {
      return 0;
    }

    let totalScore = 0;
    const maxPossibleScore = requiredSkills.length * this.WEIGHTS.EXACT_MATCH;

    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());

    requiredSkillsLower.forEach(requiredSkill => {
      // Exact match
      if (userSkillsLower.includes(requiredSkill)) {
        totalScore += this.WEIGHTS.EXACT_MATCH;
      }
      // Partial match (contains)
      else if (userSkillsLower.some(userSkill => 
        userSkill.includes(requiredSkill) || requiredSkill.includes(userSkill)
      )) {
        totalScore += this.WEIGHTS.CATEGORY_MATCH;
      }
      // Related skills
      else if (this.areSkillsRelated(requiredSkill, userSkillsLower)) {
        totalScore += this.WEIGHTS.RELATED_MATCH;
      }
    });

    // Normalize to 0-100 scale
    const normalizedScore = (totalScore / maxPossibleScore) * 100;
    return Math.min(100, Math.round(normalizedScore));
  }

  /**
   * Check if skills are related based on predefined mapping
   */
  private areSkillsRelated(skill: string, userSkills: string[]): boolean {
    const related = this.RELATED_SKILLS_MAP[skill] || [];
    return userSkills.some(userSkill => 
      related.some(r => userSkill.includes(r))
    );
  }

  /**
   * Calculate experience level difference
   */
  private getExperienceLevelDifference(
    userLevel: string, 
    jobLevel: string
  ): number {
    const levels: ExperienceLevel[] = ['entry', 'mid', 'senior'];
    const userIndex = levels.indexOf(userLevel as ExperienceLevel);
    const jobIndex = levels.indexOf(jobLevel as ExperienceLevel);

    if (userIndex === -1 || jobIndex === -1) {
      return 0;
    }

    return Math.abs(userIndex - jobIndex);
  }

  /**
   * Calculate overall match score between user and job
   */
  calculateMatchScore(user: any, job: any): number {
    // Calculate base skill score
    const skillScore = this.calculateSkillScore(user.skills, job.requiredSkills);

    // Apply experience level multiplier
    const expDiff = this.getExperienceLevelDifference(
      user.experienceLevel || 'entry',
      job.experienceLevel || 'entry'
    );

    let multiplier: number;
    if (expDiff === 0) {
      multiplier = this.EXPERIENCE_MULTIPLIERS.EXACT;
    } else if (expDiff === 1) {
      multiplier = this.EXPERIENCE_MULTIPLIERS.ONE_LEVEL_DIFF;
    } else {
      multiplier = this.EXPERIENCE_MULTIPLIERS.TWO_LEVEL_DIFF;
    }

    const finalScore = Math.round(skillScore * multiplier);
    return Math.min(100, finalScore);
  }

  /**
   * Get detailed skill gap analysis
   */
  async getSkillGap(userId: string, jobId: string): Promise<SkillGapResult | null> {
    const user = await User.findById(userId);
    const job = await Job.findById(jobId);

    if (!user || !job) {
      return null;
    }

    const userSkillsLower = (user.skills || []).map(s => s.toLowerCase());
    const requiredSkillsLower = (job.requiredSkills || []).map(s => s.toLowerCase());

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    requiredSkillsLower.forEach((requiredSkill, index) => {
      const originalSkill = job.requiredSkills[index];
      
      if (userSkillsLower.some(userSkill => 
        userSkill === requiredSkill || 
        userSkill.includes(requiredSkill) || 
        requiredSkill.includes(userSkill)
      )) {
        matchedSkills.push(originalSkill);
      } else {
        missingSkills.push(originalSkill);
      }
    });

    const matchScore = this.calculateMatchScore(user, job);
    const matchPercentage = requiredSkillsLower.length > 0
      ? Math.round((matchedSkills.length / requiredSkillsLower.length) * 100)
      : 0;

    return {
      matchScore,
      matchPercentage,
      matchedSkills,
      missingSkills,
      totalRequired: requiredSkillsLower.length,
      experienceMatch: user.experienceLevel === job.experienceLevel
    };
  }

  /**
   * Get job recommendations for a user
   */
  async getJobRecommendations(
    userId: string, 
    limit: number = 10
  ): Promise<JobRecommendation[]> {
    const user = await User.findById(userId);
    
    // Check if user exists and is a candidate/job seeker
    if (!user || (user.role as string) !== 'candidate') {
      return [];
    }

    // Get jobs user hasn't applied to
    const appliedJobIds = await Application.find({ userId })
      .distinct('jobId');

    const jobs = await Job.find({
      _id: { $nin: appliedJobIds },
      isActive: true
    }).limit(100); // Limit to 100 for performance

    // Calculate match scores
    const jobsWithScores = jobs.map(job => ({
      job,
      matchScore: this.calculateMatchScore(user, job)
    }));

    // Filter and sort by score (60%+ threshold)
    const recommendations = jobsWithScores
      .filter(item => item.matchScore >= MATCHING_CONSTANTS.THRESHOLDS.JOB_RECOMMENDATION)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)
      .map(item => ({
        ...item.job.toObject(),
        matchScore: item.matchScore
      }));

    return recommendations;
  }

  /**
   * Get candidate recommendations for a job
   */
  async getCandidateRecommendations(
    jobId: string, 
    limit: number = 20
  ): Promise<CandidateRecommendation[]> {
    const job = await Job.findById(jobId);
    
    if (!job) {
      return [];
    }

    // Get users who haven't applied
    const appliedUserIds = await Application.find({ jobId })
      .distinct('userId');

    const candidates = await User.find({
      _id: { $nin: appliedUserIds },
      role: 'candidate'
    }).limit(100);

    // Calculate match scores
    const candidatesWithScores = candidates.map(candidate => ({
      candidate,
      matchScore: this.calculateMatchScore(candidate, job)
    }));

    // Filter and sort by score (70%+ threshold)
    const recommendations = candidatesWithScores
      .filter(item => item.matchScore >= MATCHING_CONSTANTS.THRESHOLDS.CANDIDATE_RECOMMENDATION)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)
      .map(item => ({
        _id: item.candidate._id.toString(),
        name: item.candidate.name,
        email: item.candidate.email,
        avatar: item.candidate.avatar,
        skills: item.candidate.skills,
        experienceLevel: item.candidate.experienceLevel,
        bio: item.candidate.bio,
        matchScore: item.matchScore
      }));

    return recommendations;
  }
}

export default new MatchingService();
