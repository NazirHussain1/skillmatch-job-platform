import { Job, Application, User } from '../types';
import { MOCK_JOBS, MOCK_APPLICATIONS } from '../constants';

class ApiService {
  private baseUrl = process.env.VITE_API_URL || 'http://localhost:3001/api';

  // Jobs API
  async getJobs(filters?: {
    search?: string;
    location?: string;
    type?: string;
    skills?: string[];
  }): Promise<Job[]> {
    // Mock implementation - replace with real API calls
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let jobs = [...MOCK_JOBS];
    
    if (filters?.search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        job.companyName.toLowerCase().includes(filters.search!.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    if (filters?.location) {
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters?.type) {
      jobs = jobs.filter(job => job.type === filters.type);
    }
    
    if (filters?.skills && filters.skills.length > 0) {
      jobs = jobs.filter(job => 
        filters.skills!.some(skill => 
          job.requiredSkills.some(reqSkill => 
            reqSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }
    
    return jobs;
  }

  async getJobById(id: string): Promise<Job | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_JOBS.find(job => job.id === id) || null;
  }

  async createJob(jobData: Omit<Job, 'id' | 'postedAt'>): Promise<Job> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      postedAt: new Date().toISOString().split('T')[0],
    };
    
    return newJob;
  }

  async updateJob(id: string, jobData: Partial<Job>): Promise<Job | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const job = MOCK_JOBS.find(j => j.id === id);
    if (!job) return null;
    
    return { ...job, ...jobData };
  }

  async deleteJob(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }

  // Applications API
  async getApplications(userId: string): Promise<Application[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return MOCK_APPLICATIONS.filter(app => app.id.includes(userId.slice(-1)));
  }

  async createApplication(applicationData: Omit<Application, 'id' | 'appliedAt'>): Promise<Application> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newApplication: Application = {
      ...applicationData,
      id: `app-${Date.now()}`,
      appliedAt: new Date().toISOString().split('T')[0],
    };
    
    return newApplication;
  }

  async updateApplicationStatus(id: string, status: Application['status']): Promise<Application | null> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const app = MOCK_APPLICATIONS.find(a => a.id === id);
    if (!app) return null;
    
    return { ...app, status };
  }

  // User API
  async updateUserProfile(userId: string, userData: Partial<User>): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Mock update - in real app, this would update the database
    return { ...userData } as User;
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock file upload - return a placeholder URL
    return `https://picsum.photos/seed/${userId}/200`;
  }

  // Analytics API
  async getAnalytics(userId: string, role: string) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (role === 'JOB_SEEKER') {
      return {
        profileViews: Math.floor(Math.random() * 100) + 20,
        applicationsSent: Math.floor(Math.random() * 15) + 5,
        interviewsScheduled: Math.floor(Math.random() * 5) + 1,
        offersReceived: Math.floor(Math.random() * 3),
        skillMatchTrend: [
          { month: 'Jan', score: 65 },
          { month: 'Feb', score: 72 },
          { month: 'Mar', score: 78 },
          { month: 'Apr', score: 85 },
          { month: 'May', score: 88 },
        ]
      };
    } else {
      return {
        jobsPosted: Math.floor(Math.random() * 10) + 3,
        applicationsReceived: Math.floor(Math.random() * 50) + 20,
        candidatesInterviewed: Math.floor(Math.random() * 15) + 5,
        hiresMade: Math.floor(Math.random() * 5) + 1,
        applicationTrend: [
          { month: 'Jan', count: 12 },
          { month: 'Feb', count: 18 },
          { month: 'Mar', count: 25 },
          { month: 'Apr', count: 32 },
          { month: 'May', count: 28 },
        ]
      };
    }
  }
}

export const apiService = new ApiService();