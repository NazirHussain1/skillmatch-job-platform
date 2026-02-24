import { Job, Application, User } from '../types';

class ApiService {
  private baseUrl = 'http://localhost:3001';

  // Jobs API
  async getJobs(filters?: {
    search?: string;
    location?: string;
    type?: string;
    skills?: string[];
  }): Promise<Job[]> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      let jobs: Job[] = await response.json();
      
      // Apply filters
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(searchLower) ||
          job.companyName.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower)
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
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  }

  async createJob(jobData: Omit<Job, 'id' | 'postedAt'>): Promise<Job> {
    try {
      const newJob = {
        ...jobData,
        postedAt: new Date().toISOString().split('T')[0],
      };
      
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      
      if (!response.ok) throw new Error('Failed to create job');
      return await response.json();
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async updateJob(id: string, jobData: Partial<Job>): Promise<Job | null> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error updating job:', error);
      return null;
    }
  }

  async deleteJob(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting job:', error);
      return false;
    }
  }

  // Applications API
  async getApplications(userId: string): Promise<Application[]> {
    try {
      const response = await fetch(`${this.baseUrl}/applications?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  async createApplication(applicationData: Omit<Application, 'id' | 'appliedAt'>): Promise<Application> {
    try {
      const newApplication = {
        ...applicationData,
        appliedAt: new Date().toISOString().split('T')[0],
      };
      
      const response = await fetch(`${this.baseUrl}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApplication)
      });
      
      if (!response.ok) throw new Error('Failed to create application');
      return await response.json();
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  async updateApplicationStatus(id: string, status: Application['status']): Promise<Application | null> {
    try {
      const response = await fetch(`${this.baseUrl}/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error updating application:', error);
      return null;
    }
  }

  // User API
  async updateUserProfile(userId: string, userData: Partial<User>): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    // Mock file upload - in production, this would upload to a storage service
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `https://picsum.photos/seed/${userId}-${Date.now()}/200`;
  }

  // Analytics API
  async getAnalytics(userId: string, role: string) {
    try {
      // Get user-specific data from database
      const applicationsResponse = await fetch(`${this.baseUrl}/applications?userId=${userId}`);
      const applications = applicationsResponse.ok ? await applicationsResponse.json() : [];
      
      const jobsResponse = await fetch(`${this.baseUrl}/jobs?employerId=${userId}`);
      const jobs = jobsResponse.ok ? await jobsResponse.json() : [];
      
      if (role === 'JOB_SEEKER') {
        return {
          profileViews: Math.floor(Math.random() * 100) + 20,
          applicationsSent: applications.length,
          interviewsScheduled: applications.filter((a: Application) => a.status === 'Interviewing').length,
          offersReceived: applications.filter((a: Application) => a.status === 'Accepted').length,
          skillMatchTrend: [
            { month: 'Jan', score: 65 },
            { month: 'Feb', score: 72 },
            { month: 'Mar', score: 78 },
            { month: 'Apr', score: 85 },
            { month: 'May', score: 88 },
          ]
        };
      } else {
        // Get applications for employer's jobs
        const allApplicationsResponse = await fetch(`${this.baseUrl}/applications`);
        const allApplications = allApplicationsResponse.ok ? await allApplicationsResponse.json() : [];
        const employerApplications = allApplications.filter((app: Application) => 
          jobs.some((job: Job) => job.id === app.jobId)
        );
        
        return {
          jobsPosted: jobs.length,
          applicationsReceived: employerApplications.length,
          candidatesInterviewed: employerApplications.filter((a: Application) => a.status === 'Interviewing').length,
          hiresMade: employerApplications.filter((a: Application) => a.status === 'Accepted').length,
          applicationTrend: [
            { month: 'Jan', count: 12 },
            { month: 'Feb', count: 18 },
            { month: 'Mar', count: 25 },
            { month: 'Apr', count: 32 },
            { month: 'May', count: employerApplications.length },
          ]
        };
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return default data on error
      if (role === 'JOB_SEEKER') {
        return {
          profileViews: 0,
          applicationsSent: 0,
          interviewsScheduled: 0,
          offersReceived: 0,
          skillMatchTrend: []
        };
      } else {
        return {
          jobsPosted: 0,
          applicationsReceived: 0,
          candidatesInterviewed: 0,
          hiresMade: 0,
          applicationTrend: []
        };
      }
    }
  }
}

export const apiService = new ApiService();