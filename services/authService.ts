import { User } from '../types';

interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'JOB_SEEKER' | 'EMPLOYER';
  companyName?: string;
}

class AuthService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('skillmatch_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }

      // Store token
      if (data.token) {
        localStorage.setItem('skillmatch_token', data.token);
      }

      // Transform MongoDB _id to id for frontend
      const user: User = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        skills: data.skills || [],
        bio: data.bio,
        companyName: data.companyName
      };

      return { success: true, user, token: data.token };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async signup(userData: SignupData): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Signup failed' };
      }

      // Store token
      if (data.token) {
        localStorage.setItem('skillmatch_token', data.token);
      }

      // Transform MongoDB _id to id for frontend
      const user: User = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        skills: data.skills || [],
        bio: data.bio,
        companyName: data.companyName
      };

      return { success: true, user, token: data.token };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async getMe(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        return null;
      }

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
      console.error('Get me error:', error);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('skillmatch_token');
    localStorage.removeItem('skillmatch_user');
  }
}

export const authService = new AuthService();
