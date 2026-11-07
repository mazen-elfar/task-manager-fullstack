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

// Response interceptor to format error responses consistently and purge stale tokens on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: boolean; error: ApiError }>) => {
    if (error.response?.status === 401) {
      // Whenever authentication is rejected, immediately remove token from storage
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    const customError = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error occurred. Please check your connection.'
    };

    return Promise.reject(customError);
  }
);
