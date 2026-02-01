import { User, UserRole } from '../types';
import { MOCK_USER, MOCK_EMPLOYER } from '../constants';

interface LoginResponse {
  success: boolean;
  user?: User;
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
  // Mock authentication - replace with real API calls
  async login(email: string, password: string): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication logic
    if (email === 'alex@example.com' && password === 'password') {
      return { success: true, user: MOCK_USER };
    }
    
    if (email === 'hr@techcorp.com' && password === 'password') {
      return { success: true, user: MOCK_EMPLOYER };
    }

    // Demo accounts for testing
    if (email === 'demo@jobseeker.com' && password === 'demo123') {
      return { 
        success: true, 
        user: {
          ...MOCK_USER,
          email: 'demo@jobseeker.com',
          name: 'Demo Job Seeker'
        }
      };
    }

    if (email === 'demo@employer.com' && password === 'demo123') {
      return { 
        success: true, 
        user: {
          ...MOCK_EMPLOYER,
          email: 'demo@employer.com',
          name: 'Demo Employer'
        }
      };
    }

    return { success: false, error: 'Invalid email or password' };
  }

  async signup(userData: SignupData): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock validation
    if (userData.email === 'existing@example.com') {
      return { success: false, error: 'Email already exists' };
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role === 'JOB_SEEKER' ? UserRole.JOB_SEEKER : UserRole.EMPLOYER,
      skills: [],
      avatar: `https://picsum.photos/seed/${userData.name}/200`,
      companyName: userData.companyName,
    };

    return { success: true, user: newUser };
  }

  async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock success for any email
    return { success: true };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  }
}

export const authService = new AuthService();