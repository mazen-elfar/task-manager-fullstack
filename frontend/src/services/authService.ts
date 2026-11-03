import { apiClient } from './api';
import { AuthResponse, User } from '../types/auth';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    return response.data.user;
  }
};
