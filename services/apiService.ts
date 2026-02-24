import { Job, Application, User } from '../types';

class ApiService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('skillmatch_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private transformJob(data: any): Job {
    return {
      id: data._id,
      title: data.title,
      employerId: data.employerId,
      companyName: data.companyName,
      location: data.location,
      salary: data.salary,
      type: data.type,
      description: data.description,
      requiredSkills: data.requiredSkills,
      postedAt: data.postedAt
    };
  }

  private transformApplication(data: any): Application {
    return {
      id: data._id,
      jobId: data.jobId,
      userId: data.userId,
      jobTitle: data.jobTitle,
      companyName: data.companyName,
      status: data.status,
      appliedAt: data.appliedAt,
      matchScore: data.matchScore
    };
  }

  // Jobs API
  async getJobs(filters?: {
    search?: string;
    location?: string;
    type?: string;
    skills?: string[];
  }): Promise<Job[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.skills?.length) params.append('skills', filters.skills.join(','));

      const response = await fetch(`${this.baseUrl}/jobs?${params}`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();
      return data.map(this.transformJob);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) return null;

      const data = await response.json();
      return this.transformJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  }

  async createJob(jobData: Omit<Job, 'id' | 'postedAt'>): Promise<Job> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create job');
      }

      const data = await response.json();
      return this.transformJob(data);
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async updateJob(id: string, jobData: Partial<Job>): Promise<Job | null> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify(jobData)
      });

      if (!response.ok) return null;

      const data = await response.json();
      return this.transformJob(data);
    } catch (error) {
      console.error('Error updating job:', error);
      return null;
    }
  }

  async deleteJob(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeader()
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
      const response = await fetch(`${this.baseUrl}/applications`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) throw new Error('Failed to fetch applications');

      const data = await response.json();
      return data.map(this.transformApplication);
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  async createApplication(applicationData: Omit<Application, 'id' | 'appliedAt'>): Promise<Application> {
    try {
      const response = await fetch(`${this.baseUrl}/applications`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create application');
      }

      const data = await response.json();
      return this.transformApplication(data);
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  async updateApplicationStatus(id: string, status: Application['status']): Promise<Application | null> {
    try {
      const response = await fetch(`${this.baseUrl}/applications/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) return null;

      const data = await response.json();
      return this.transformApplication(data);
    } catch (error) {
      console.error('Error updating application:', error);
      return null;
    }
  }

  // User API
  async updateUserProfile(userId: string, userData: Partial<User>): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        skills: data.skills || [],
        bio: data.bio,
        companyName: data.companyName
      };
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
      const response = await fetch(`${this.baseUrl}/users/analytics`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');

      return await response.json();
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
