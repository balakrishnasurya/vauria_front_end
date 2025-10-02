import { localStorageService } from '@/services/localStorage.service';

class HttpService {
  private getHeaders(): HeadersInit {
    const token = localStorageService.getItem('vauria_user_token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async get(url: string): Promise<Response> {
    return fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });
  }

  async post<T = any>(url: string, data: T): Promise<Response> {
    return fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
  }

  async put<T = any>(url: string, data: T): Promise<Response> {
    return fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
  }

  async patch<T = any>(url: string, data: T): Promise<Response> {
    return fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
  }

  async delete(url: string): Promise<Response> {
    return fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }
}

export const httpService = new HttpService();
