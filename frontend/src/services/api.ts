import axios, { AxiosError } from 'axios';
import { ApiError } from '../types/auth';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token if stored in localStorage (works alongside HttpOnly cookies for maximum client compatibility)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format error responses consistently
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: boolean; error: ApiError }>) => {
    if (error.response?.status === 401) {
      // If unauthorized on a protected route, remove local token
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      if (!isAuthCheck) {
        localStorage.removeItem('token');
      }
    }

    const customError = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error occurred. Please check your connection.'
    };

    return Promise.reject(customError);
  }
);
