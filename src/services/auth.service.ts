import { mockUsers } from '@/data/products.data';
import { User } from '@/models/interfaces/product.interface';
import { BACKEND_ROUTES } from '@/constants/routes/routes.constants';
import { localStorageService } from '@/services/localStorage.service';
import { httpService } from '@/services/http.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}

export class AuthService {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Handle session expiry - logout and set message
  async handleSessionExpiry(): Promise<void> {
    await this.logout(true);
  }

  // Login user (supports both login({ email, password }) and login(email, password))
  async login(email: string, password: string): Promise<AuthResponse>;
  async login(credentials: LoginCredentials): Promise<AuthResponse>;
  async login(arg1: string | LoginCredentials, arg2?: string): Promise<AuthResponse> {
    const credentials: LoginCredentials = typeof arg1 === 'string'
      ? { email: arg1, password: arg2 ?? '' }
      : arg1;
    const { email, password } = credentials;

    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }

    try {
      const loginUrl = BACKEND_ROUTES?.LOGIN;
      if (!loginUrl || !/^https?:\/\//i.test(loginUrl)) {
        return { success: false, message: 'Login route is not configured. Please set NEXT_PUBLIC_BACKEND_BASE_URL.' };
      }

      const res = await httpService.post(loginUrl, { email, password });

      if (!res.ok) {
        let errorMsg = 'Login failed';
        try {
          const errJson = await res.json();
          errorMsg = errJson?.message || errorMsg;
        } catch {}
        return { success: false, message: errorMsg };
      }

      const data: { access_token: string; token_type: string } = await res.json();
      const token = data.access_token;
      const tokenType = data.token_type;

      // Persist token using localStorageService
      localStorageService.setItem('vauria_user_token', token);
      localStorageService.setItem('vauria_token_type', tokenType);

      // Try to decode JWT to derive user info
      const payload = this.decodeJwt<{ user_id?: number | string; email?: string; role?: string; exp?: number }>(token);
      const user: User = {
        id: (payload?.user_id ?? 'unknown').toString(),
        email: payload?.email ?? email,
        firstName: '',
        lastName: '',
        role: (payload?.role as any) ?? 'customer',
        createdAt: new Date().toISOString()
      } as User;

      // Store basic user info for quick access
      localStorageService.setItem('vauria_user_email', user.email);
      localStorageService.setItem('vauria_user_id', user.id);

      return {
        success: true,
        user,
        token,
        message: 'Login successful'
      };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Network error during login' };
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const { email, password, first_name, last_name, phone, gender } = data;

    if (!email || !password || !first_name || !last_name) {
      return { success: false, message: 'All required fields must be filled' };
    }

    try {
      const signupUrl = BACKEND_ROUTES?.SIGNUP;
      if (!signupUrl || !/^https?:\/\//i.test(signupUrl)) {
        return { success: false, message: 'Signup route is not configured. Please set NEXT_PUBLIC_BACKEND_BASE_URL.' };
      }

      const res = await httpService.post(signupUrl, {
        first_name,
        last_name,
        email,
        password,
        phone: phone || '',
        gender: gender || 'male'
      });

      if (!res.ok) {
        let errorMsg = 'Registration failed';
        try {
          const errJson = await res.json();
          errorMsg = errJson?.message || errorMsg;
        } catch {}
        return { success: false, message: errorMsg };
      }

      const userData = await res.json();
      
      // Create user object from API response
      const newUser: User = {
        id: userData.id.toString(),
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        phone: userData.phone,
        role: userData.role || 'customer',
        createdAt: new Date().toISOString()
      };

      // After successful registration, automatically log the user in
      const loginResponse = await this.login(email, password);
      
      if (loginResponse.success) {
        return {
          success: true,
          user: newUser,
          token: loginResponse.token,
          message: 'Registration and login successful'
        };
      } else {
        // Registration succeeded but login failed
        return {
          success: true,
          user: newUser,
          message: 'Registration successful. Please log in.'
        };
      }
    } catch (e: any) {
      return { success: false, message: e?.message || 'Network error during registration' };
    }
  }

  // Logout user
  async logout(isSessionExpired: boolean = false): Promise<void> {
    await this.delay(200);
    
    localStorageService.removeItem('vauria_user_token');
    localStorageService.removeItem('vauria_token_type');
    localStorageService.removeItem('vauria_user_email');
    localStorageService.removeItem('vauria_user_id');
    
    if (isSessionExpired && typeof window !== 'undefined') {
      localStorage.setItem('vauria_login_message', 'Your session has expired. Please login again.');
    }
  }

  // Get current user from session (decode JWT if available)
  async getCurrentUser(): Promise<User | null> {
    await this.delay(200);

    const token = localStorageService.getItem('vauria_user_token');
    if (!token) return null;

    const payload = this.decodeJwt<{ user_id?: number | string; email?: string; role?: string }>(token);
    if (!payload) return null;

    const id = (payload.user_id ?? localStorageService.getItem('vauria_user_id') ?? 'unknown').toString();
    const email = payload.email ?? localStorageService.getItem('vauria_user_email') ?? '';
    const role = (payload.role as any) ?? 'customer';

    // Optionally try to enrich from mock store if exists
    const mock = mockUsers.find(u => u.id === id) as User | undefined;
    if (mock) {
      return mock;
    }
    return {
      id,
      email,
      firstName: '',
      lastName: '',
      role,
      createdAt: new Date().toISOString()
    } as User;
  }

  // Helper: decode JWT payload safely
  private decodeJwt<T = any>(token: string): T | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorageService.getItem('vauria_user_token');
    return !!token;
  }

  // Forgot password (mock implementation)
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await this.delay(800);

    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return {
        success: false,
        message: 'No account found with this email address'
      };
    }

    return {
      success: true,
      message: 'Password reset link has been sent to your email'
    };
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResponse> {
    await this.delay(600);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found'
      };
    } else {
      // Update user data
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      return {
        success: true,
        user: mockUsers[userIndex],
        message: 'Profile updated successfully'
      };
    }
  }
}

export const authService = new AuthService();