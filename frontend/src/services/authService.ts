import { apiClient } from './api';
import { ApiError, AuthResponse, User } from '../types/auth';

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

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
      return response.data.user;
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError?.status === 401 || apiError?.code === 'UNAUTHORIZED_ERROR') {
        // Expected unauthenticated state during startup or expired session recovery
        return null;
      }
      throw err;
    }
  }
};
