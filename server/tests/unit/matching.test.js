import { describe, it, expect, beforeEach } from '@jest/globals';
import matchingService from '../../src/modules/matching/matching.service.js';

describe('Matching Engine - Scoring Logic', () => {
  let mockUser;
  let mockJob;

  beforeEach(() => {
    mockUser = {
      _id: 'user123',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experienceLevel: 'mid',
      yearsOfExperience: 4
    };

    mockJob = {
      _id: 'job123',
      title: 'Full Stack Developer',
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
      experienceLevel: 'mid',
      minExperience: 3,
      maxExperience: 6
    };
  });

  describe('Skill Matching', () => {
    it('should calculate exact skill matches correctly', () => {
      const result = matchingService.calculateSkillScore(mockUser.skills, mockJob.requiredSkills);
      
      // User has 3 out of 5 required skills (JavaScript, React, Node.js)
      expect(result.exactMatches).toBe(3);
      expect(result.totalRequired).toBe(5);
    });

    it('should give higher score for exact matches', () => {
      const exactMatchJob = {
        ...mockJob,
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB']
      };

      const result = matchingService.calculateSkillScore(mockUser.skills, exactMatchJob.requiredSkills);
      
      expect(result.exactMatches).toBe(4);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should handle case-insensitive skill matching', () => {
      const userWithMixedCase = {
        ...mockUser,
        skills: ['javascript', 'REACT', 'node.js']
      };

      const result = matchingService.calculateSkillScore(
        userWithMixedCase.skills,
        ['JavaScript', 'React', 'Node.js']
      );

      expect(result.exactMatches).toBe(3);
    });

    it('should identify missing skills', () => {
      const result = matchingService.calculateSkillScore(mockUser.skills, mockJob.requiredSkills);
      
      expect(result.missingSkills).toContain('PostgreSQL');
      expect(result.missingSkills).toContain('Docker');
      expect(result.missingSkills.length).toBe(2);
    });

    it('should detect related skills', () => {
      const userWithRelated = {
        ...mockUser,
        skills: ['JavaScript', 'Vue.js', 'Express', 'MySQL']
      };

      const result = matchingService.calculateSkillScore(
        userWithRelated.skills,
        ['JavaScript', 'React', 'Node.js', 'PostgreSQL']
      );

      // Vue.js is related to React, Express to Node.js, MySQL to PostgreSQL
      expect(result.relatedMatches).toBeGreaterThan(0);
    });
  });

  describe('Experience Level Matching', () => {
    it('should match exact experience level', () => {
      const result = matchingService.calculateExperienceScore(
        mockUser.experienceLevel,
        mockUser.yearsOfExperience,
        mockJob.experienceLevel,
        mockJob.minExperience,
        mockJob.maxExperience
      );

      expect(result.levelMatch).toBe(true);
      expect(result.yearsMatch).toBe(true);
      expect(result.multiplier).toBeGreaterThanOrEqual(1.0);
    });

    it('should penalize overqualified candidates', () => {
      const seniorUser = {
        ...mockUser,
        experienceLevel: 'senior',
        yearsOfExperience: 10
      };

      const entryJob = {
        ...mockJob,
        experienceLevel: 'entry',
        minExperience: 0,
        maxExperience: 2
      };

      const result = matchingService.calculateExperienceScore(
        seniorUser.experienceLevel,
        seniorUser.yearsOfExperience,
        entryJob.experienceLevel,
        entryJob.minExperience,
        entryJob.maxExperience
      );

      expect(result.multiplier).toBeLessThan(1.0);
    });

    it('should penalize underqualified candidates', () => {
      const entryUser = {
        ...mockUser,
        experienceLevel: 'entry',
        yearsOfExperience: 1
      };

      const seniorJob = {
        ...mockJob,
        experienceLevel: 'senior',
        minExperience: 7,
        maxExperience: 15
      };

      const result = matchingService.calculateExperienceScore(
        entryUser.experienceLevel,
        entryUser.yearsOfExperience,
        seniorJob.experienceLevel,
        seniorJob.minExperience,
        seniorJob.maxExperience
      );

      expect(result.multiplier).toBeLessThan(1.0);
    });
  });

  describe('Overall Match Score', () => {
    it('should calculate overall match score correctly', async () => {
      const result = await matchingService.calculateMatch(mockUser, mockJob);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('skillMatch');
      expect(result).toHaveProperty('experienceMatch');
      expect(result).toHaveProperty('recommendation');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should recommend high-match jobs (>70%)', async () => {
      const perfectMatchJob = {
        ...mockJob,
        requiredSkills: mockUser.skills,
        experienceLevel: mockUser.experienceLevel,
        minExperience: mockUser.yearsOfExperience - 1,
        maxExperience: mockUser.yearsOfExperience + 1
      };

      const result = await matchingService.calculateMatch(mockUser, perfectMatchJob);

      expect(result.score).toBeGreaterThan(70);
      expect(result.recommendation).toBe('highly_recommended');
    });

    it('should not recommend low-match jobs (<40%)', async () => {
      const poorMatchJob = {
        ...mockJob,
        requiredSkills: ['Python', 'Django', 'Kubernetes', 'AWS', 'Terraform'],
        experienceLevel: 'senior',
        minExperience: 8,
        maxExperience: 12
      };

      const result = await matchingService.calculateMatch(mockUser, poorMatchJob);

      expect(result.score).toBeLessThan(40);
      expect(result.recommendation).toBe('not_recommended');
    });

    it('should provide skill gap analysis', async () => {
      const result = await matchingService.calculateMatch(mockUser, mockJob);

      expect(result).toHaveProperty('skillGap');
      expect(result.skillGap).toHaveProperty('missing');
      expect(result.skillGap).toHaveProperty('suggestions');
      expect(Array.isArray(result.skillGap.missing)).toBe(true);
    });
  });

  describe('Weight-Based Scoring', () => {
    it('should apply correct weights to skill categories', () => {
      const result = matchingService.calculateWeightedScore({
        exactMatches: 3,
        categoryMatches: 1,
        relatedMatches: 1,
        totalRequired: 5
      });

      // Exact: 2.0x, Category: 1.5x, Related: 1.0x
      const expectedScore = ((3 * 2.0) + (1 * 1.5) + (1 * 1.0)) / (5 * 2.0) * 100;
      
      expect(result).toBeCloseTo(expectedScore, 1);
    });

    it('should prioritize exact matches over related matches', () => {
      const exactScore = matchingService.calculateWeightedScore({
        exactMatches: 3,
        categoryMatches: 0,
        relatedMatches: 0,
        totalRequired: 5
      });

      const relatedScore = matchingService.calculateWeightedScore({
        exactMatches: 0,
        categoryMatches: 0,
        relatedMatches: 3,
        totalRequired: 5
      });

      expect(exactScore).toBeGreaterThan(relatedScore);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty skill arrays', () => {
      const result = matchingService.calculateSkillScore([], mockJob.requiredSkills);
      
      expect(result.exactMatches).toBe(0);
      expect(result.score).toBe(0);
    });

    it('should handle jobs with no required skills', () => {
      const result = matchingService.calculateSkillScore(mockUser.skills, []);
      
      expect(result.score).toBe(100); // Perfect match if no requirements
    });

    it('should handle null or undefined values gracefully', () => {
      expect(() => {
        matchingService.calculateSkillScore(null, mockJob.requiredSkills);
      }).not.toThrow();

      expect(() => {
        matchingService.calculateSkillScore(mockUser.skills, undefined);
      }).not.toThrow();
    });

    it('should handle duplicate skills', () => {
      const userWithDuplicates = {
        ...mockUser,
        skills: ['JavaScript', 'JavaScript', 'React', 'React']
      };

      const result = matchingService.calculateSkillScore(
        userWithDuplicates.skills,
        ['JavaScript', 'React']
      );

      // Should count each skill only once
      expect(result.exactMatches).toBe(2);
    });
  });

  describe('Performance', () => {
    it('should calculate match score in reasonable time', async () => {
      const start = Date.now();
      
      await matchingService.calculateMatch(mockUser, mockJob);
      
      const duration = Date.now() - start;
      
      // Should complete in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle large skill arrays efficiently', async () => {
      const largeSkillSet = Array.from({ length: 100 }, (_, i) => `Skill${i}`);
      
      const userWithManySkills = {
        ...mockUser,
        skills: largeSkillSet
      };

      const jobWithManySkills = {
        ...mockJob,
        requiredSkills: largeSkillSet.slice(0, 50)
      };

      const start = Date.now();
      
      await matchingService.calculateMatch(userWithManySkills, jobWithManySkills);
      
      const duration = Date.now() - start;
      
      // Should still complete in reasonable time
      expect(duration).toBeLessThan(200);
    });
  });
});
