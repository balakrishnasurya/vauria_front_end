// Authentication utilities

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'vauria_user_token',
  EMAIL: 'vauria_user_email',
  USER_ID: 'vauria_user_id',
  REFRESH_TOKEN: 'vauria_refresh_token',
} as const;

export const getStoredToken = (): string | null => {
  return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
};

export const getStoredUserId = (): string | null => {
  return localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID);
};

export const getStoredUserEmail = (): string | null => {
  return localStorage.getItem(AUTH_STORAGE_KEYS.EMAIL);
};

export const setAuthStorage = (token: string, userId: string, email: string) => {
  localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.USER_ID, userId);
  localStorage.setItem(AUTH_STORAGE_KEYS.EMAIL, email);
};

export const clearAuthStorage = () => {
  Object.values(AUTH_STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export const isTokenExpired = (token: string): boolean => {
  try {
    // Mock token validation - in real app, decode JWT and check expiration
    const parts = token.split('-');
    if (parts.length < 3) return true;
    
    const timestamp = parseInt(parts[parts.length - 1]);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    return (now - timestamp) > oneDay;
  } catch {
    return true;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePhone = (phone: string): boolean => {
  // Indian phone number validation
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

export const generateGuestId = (): string => {
  return `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getUserDisplayName = (user: {
  firstName?: string;
  lastName?: string;
  email: string;
}): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  return user.email.split('@')[0];
};

export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;
  
  const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
  return `${maskedUsername}@${domain}`;
};

export const generateAvatar = (name: string): string => {
  // Generate a simple avatar URL based on initials
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Using a service like UI Avatars (in real app, you might use a different service)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=D4AF37&color=0A2342&size=128`;
};