
import { User, Job, UserRole, Application } from './types';

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Alex Rivera',
  email: 'alex@example.com',
  role: UserRole.JOB_SEEKER,
  avatar: 'https://picsum.photos/seed/alex/200',
  skills: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB'],
  bio: 'Passionate full-stack developer with 3 years of experience in building modern web applications.'
};

export const MOCK_EMPLOYER: User = {
  id: 'employer-1',
  name: 'Sarah Chen',
  email: 'hr@techcorp.com',
  role: UserRole.EMPLOYER,
  companyName: 'TechCorp Systems',
  skills: [],
  avatar: 'https://picsum.photos/seed/sarah/200'
};

export const MOCK_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    employerId: 'employer-1',
    companyName: 'TechCorp Systems',
    location: 'San Francisco, CA',
    salary: '$140k - $180k',
    type: 'Remote',
    description: 'We are looking for a React expert to lead our dashboard team...',
    requiredSkills: ['React', 'TypeScript', 'Redux', 'Tailwind CSS', 'D3.js'],
    postedAt: '2024-05-10'
  },
  {
    id: 'job-2',
    title: 'Backend Developer',
    employerId: 'employer-2',
    companyName: 'DataNexus',
    location: 'Austin, TX',
    salary: '$120k - $150k',
    type: 'Full-time',
    description: 'Scale our microservices using Node.js and AWS...',
    requiredSkills: ['Node.js', 'AWS', 'PostgreSQL', 'Docker', 'Redis'],
    postedAt: '2024-05-12'
  },
  {
    id: 'job-3',
    title: 'Full Stack Web Developer',
    employerId: 'employer-1',
    companyName: 'TechCorp Systems',
    location: 'Remote',
    salary: '$130k - $160k',
    type: 'Remote',
    description: 'Build end-to-end features for our customer portal...',
    requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Next.js'],
    postedAt: '2024-05-14'
  }
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-3',
    jobTitle: 'Full Stack Web Developer',
    companyName: 'TechCorp Systems',
    status: 'Reviewing',
    appliedAt: '2024-05-15',
    matchScore: 92
  }
];
