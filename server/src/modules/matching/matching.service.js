import Job from '../jobs/job.model.js';
import User from '../users/user.model.js';
import Application from '../applications/application.model.js';

class MatchingService {
  // Skill weights
  WEIGHTS = {
    EXACT_MATCH: 2.0,
    CATEGORY_MATCH: 1.5,
    RELATED_MATCH: 1.0
  };

  // Experience level multipliers
  EXPERIENCE_MULTIPLIERS = {
    EXACT: 1.0,
    ONE_LEVEL_DIFF: 0.8,
    TWO_LEVEL_DIFF: 0.5
  };

  calculateSkillScore(userSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) {
      return 50;
    }

    if (!userSkills || userSkills.length === 0) {
      return 0;
    }

    let totalScore = 0;
    let maxPossibleScore = requiredSkills.length * this.WEIGHTS.EXACT_MATCH;

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
      // Related skills (basic similarity)
      else if (this.areSkillsRelated(requiredSkill, userSkillsLower)) {
        totalScore += this.WEIGHTS.RELATED_MATCH;
      }
    });

    // Normalize to 0-100 scale
    const normalizedScore = (totalScore / maxPossibleScore) * 100;
    return Math.min(100, Math.round(normalizedScore));
  }

  areSkillsRelated(skill, userSkills) {
    const relatedSkills = {
      'javascript': ['typescript', 'node', 'react', 'vue', 'angular'],
      'python': ['django', 'flask', 'fastapi', 'pandas', 'numpy'],
      'java': ['spring', 'hibernate', 'maven', 'gradle'],
      'react': ['javascript', 'typescript', 'redux', 'next'],
      'node': ['javascript', 'typescript', 'express', 'nest'],
      'sql': ['mysql', 'postgresql', 'mongodb', 'database'],
      'aws': ['cloud', 'azure', 'gcp', 'devops'],
      'docker': ['kubernetes', 'devops', 'ci/cd', 'jenkins']
    };

    const related = relatedSkills[skill] || [];
    return userSkills.some(userSkill => 
      related.some(r => userSkill.includes(r))
    );
  }

  getExperienceLevelDifference(userLevel, jobLevel) {
    const levels = ['entry', 'mid', 'senior'];
    const userIndex = levels.indexOf(userLevel);
    const jobIndex = levels.indexOf(jobLevel);

    if (userIndex === -1 || jobIndex === -1) {
      return 0;
    }

    return Math.abs(userIndex - jobIndex);
  }

  calculateMatchScore(user, job) {
    // Calculate base skill score
    const skillScore = this.calculateSkillScore(user.skills, job.requiredSkills);

    // Apply experience level multiplier
    const expDiff = this.getExperienceLevelDifference(
      user.experienceLevel || 'entry',
      job.experienceLevel || 'entry'
    );

    let multiplier;
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

  async getSkillGap(userId, jobId) {
    const user = await User.findById(userId);
    const job = await Job.findById(jobId);

    if (!user || !job) {
      return null;
    }

    const userSkillsLower = (user.skills || []).map(s => s.toLowerCase());
    const requiredSkillsLower = (job.requiredSkills || []).map(s => s.toLowerCase());

    const matchedSkills = [];
    const missingSkills = [];

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

  async getJobRecommendations(userId, limit = 10) {
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'JOB_SEEKER') {
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

    // Filter and sort by score
    const recommendations = jobsWithScores
      .filter(item => item.matchScore >= 60)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)
      .map(item => ({
        ...item.job.toObject(),
        matchScore: item.matchScore
      }));

    return recommendations;
  }

  async getCandidateRecommendations(jobId, limit = 20) {
    const job = await Job.findById(jobId);
    
    if (!job) {
      return [];
    }

    // Get users who haven't applied
    const appliedUserIds = await Application.find({ jobId })
      .distinct('userId');

    const candidates = await User.find({
      _id: { $nin: appliedUserIds },
      role: 'JOB_SEEKER'
    }).limit(100);

    // Calculate match scores
    const candidatesWithScores = candidates.map(candidate => ({
      candidate,
      matchScore: this.calculateMatchScore(candidate, job)
    }));

    // Filter and sort by score
    const recommendations = candidatesWithScores
      .filter(item => item.matchScore >= 70)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)
      .map(item => ({
        _id: item.candidate._id,
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
