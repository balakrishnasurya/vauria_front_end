import { localStorageService } from '@/services/localStorage.service';

// Global session expiry callback type
type SessionExpiredCallback = () => void;

class HttpService {
  private onSessionExpired: SessionExpiredCallback | null = null;

  // Set callback for when session expires
  setSessionExpiredCallback(callback: SessionExpiredCallback) {
    this.onSessionExpired = callback;
  }

  private getHeaders(): HeadersInit {
    const token = localStorageService.getItem('vauria_user_token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async handleResponse(response: Response): Promise<Response> {
    // Check if the response indicates token expiry
    if (response.status === 401 || response.status === 403) {
      try {
        const errorData = await response.clone().json();
        const errorMessage = errorData.detail || errorData.message || '';
        
        // Check for various token expiry error messages
        const tokenExpiredPatterns = [
          'Invalid token',
          'Token has expired', 
          'Expired token',
          'Authentication failed',
          'Token expired',
          'Session expired',
          'Access denied'
        ];
        
        const isTokenExpired = tokenExpiredPatterns.some(pattern => 
          errorMessage.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (isTokenExpired && this.onSessionExpired) {
          // Small delay to prevent multiple rapid calls
          setTimeout(() => {
            if (this.onSessionExpired) {
              this.onSessionExpired();
            }
          }, 100);
        }
      } catch (error) {
        // If we can't parse the response, but it's 401/403, assume token expiry
        if (this.onSessionExpired) {
          setTimeout(() => {
            if (this.onSessionExpired) {
              this.onSessionExpired();
            }
          }, 100);
        }
      }
    }
    return response;
  }

  async get(url: string): Promise<Response> {
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async post<T = any>(url: string, data: T): Promise<Response> {
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async put<T = any>(url: string, data: T): Promise<Response> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async patch<T = any>(url: string, data: T): Promise<Response> {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async delete(url: string): Promise<Response> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
}

export const httpService = new HttpService();
