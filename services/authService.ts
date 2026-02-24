import { User, UserRole } from '../types';

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
  private baseUrl = 'http://localhost:3001';

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Fetch user by email
      const response = await fetch(`${this.baseUrl}/users?email=${email}`);
      if (!response.ok) {
        return { success: false, error: 'Network error' };
      }

      const users = await response.json();
      
      if (users.length === 0) {
        return { success: false, error: 'Invalid email or password' };
      }

      const user = users[0];
      
      // Simple password check (in production, use proper password hashing)
      // For demo purposes, we accept "password" or "demo123"
      if (password === 'password' || password === 'demo123') {
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword as User };
      }

      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  async signup(userData: SignupData): Promise<LoginResponse> {
    try {
      // Check if email already exists
      const checkResponse = await fetch(`${this.baseUrl}/users?email=${userData.email}`);
      const existingUsers = await checkResponse.json();
      
      if (existingUsers.length > 0) {
        return { success: false, error: 'Email already exists' };
      }

      // Create new user
      const newUser = {
        name: userData.name,
        email: userData.email,
        password: '$2a$10$hashedpassword', // Mock hashed password
        role: userData.role,
        skills: [],
        avatar: `https://picsum.photos/seed/${userData.name.replace(/\s/g, '')}/200`,
        ...(userData.companyName && { companyName: userData.companyName }),
      };

      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        return { success: false, error: 'Failed to create account' };
      }

      const createdUser = await response.json();
      const { password: _, ...userWithoutPassword } = createdUser;
      
      return { success: true, user: userWithoutPassword as User };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user exists
      const response = await fetch(`${this.baseUrl}/users?email=${email}`);
      const users = await response.json();
      
      if (users.length === 0) {
        return { success: false, error: 'Email not found' };
      }
      
      // In production, send password reset email
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: 'Failed to process request' };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    // In production, validate token and update password
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }
}

export const authService = new AuthService();