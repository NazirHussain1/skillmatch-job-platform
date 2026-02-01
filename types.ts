
export enum UserRole {
  JOB_SEEKER = 'JOB_SEEKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  skills: string[];
  bio?: string;
  companyName?: string;
}

export interface Job {
  id: string;
  title: string;
  employerId: string;
  companyName: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  requiredSkills: string[];
  postedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: 'Pending' | 'Reviewing' | 'Interviewing' | 'Accepted' | 'Rejected';
  appliedAt: string;
  matchScore?: number;
}

export interface MatchResult {
  score: number;
  reasoning: string;
  missingSkills: string[];
}
