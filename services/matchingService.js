import { Job, User, MatchResult } from '../types';

/**
 * Calculate skill match score between user and job
 * Uses a weighted algorithm based on skill overlap
 */
export const calculateSkillMatch = (user: User, job: Job): MatchResult => {
  const userSkills = user.skills.map(s => s.toLowerCase());
  const requiredSkills = job.requiredSkills.map(s => s.toLowerCase());
  
  // Find matching skills
  const matchingSkills = requiredSkills.filter(skill => 
    userSkills.some(userSkill => 
      userSkill.includes(skill) || skill.includes(userSkill)
    )
  );
  
  // Find missing skills
  const missingSkills = job.requiredSkills.filter(skill => 
    !userSkills.some(userSkill => 
      userSkill.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(userSkill.toLowerCase())
    )
  );
  
  // Calculate base score (0-100)
  const baseScore = requiredSkills.length > 0 
    ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
    : 50;
  
  // Bonus points for extra relevant skills
  const extraSkillsBonus = Math.min(
    Math.floor((userSkills.length - matchingSkills.length) * 2), 
    10
  );
  
  const finalScore = Math.min(baseScore + extraSkillsBonus, 100);
  
  // Generate reasoning based on score
  let reasoning = '';
  if (finalScore >= 90) {
    reasoning = `Excellent match! You have ${matchingSkills.length} of ${requiredSkills.length} required skills. Your profile aligns perfectly with this role.`;
  } else if (finalScore >= 75) {
    reasoning = `Strong match! You possess ${matchingSkills.length} of ${requiredSkills.length} required skills. Consider highlighting your relevant experience.`;
  } else if (finalScore >= 60) {
    reasoning = `Good potential! You have ${matchingSkills.length} of ${requiredSkills.length} required skills. Upskilling in missing areas could strengthen your application.`;
  } else if (finalScore >= 40) {
    reasoning = `Moderate match. You have ${matchingSkills.length} of ${requiredSkills.length} required skills. This role may require additional training.`;
  } else {
    reasoning = `Limited match. You have ${matchingSkills.length} of ${requiredSkills.length} required skills. Consider roles that better align with your current skillset.`;
  }
  
  return {
    score: finalScore,
    reasoning,
    missingSkills
  };
};
