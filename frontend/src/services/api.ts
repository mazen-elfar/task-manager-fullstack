import axios, { AxiosError } from 'axios';
import { ApiError } from '../types/auth';

const resolveBaseURL = (): string => {
  const configuredUrl =
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    import.meta.env.VITE_API_URL?.trim();

  if (!configuredUrl) {
    return '/api/v1';
  }

  const normalizedUrl = configuredUrl.replace(/\/+$/, '');
  return normalizedUrl.endsWith('/api/v1') ? normalizedUrl : `${normalizedUrl}/api/v1`;
};

const baseURL = resolveBaseURL();

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const hasStructuredApiError = (
  payload: unknown
): payload is { error: Pick<ApiError, 'code' | 'message' | 'details'> } => {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) {
    return false;
  }

  const errorObj = (payload as { error?: unknown }).error;
  return Boolean(
    errorObj &&
      typeof errorObj === 'object' &&
      typeof (errorObj as { code?: unknown }).code === 'string' &&
      typeof (errorObj as { message?: unknown }).message === 'string'
  );
};

const getSafeEndpoint = (url?: string): string => {
  return (url || 'unknown').split('?')[0];
};

const clearSessionAndNotify = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  window.dispatchEvent(new Event('auth:unauthorized'));
};

// Attach token if stored in localStorage (works alongside HttpOnly cookies for maximum client compatibility)
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized response interceptor distinguishing expected auth responses from server, network, CORS, and malformed errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success?: boolean; error?: ApiError }>) => {
    // Preserve request cancellation semantics (e.g., AbortController in search/filter hooks)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const method = error.config?.method?.toUpperCase() || 'REQUEST';
    const endpoint = getSafeEndpoint(error.config?.url);
    const hadAuthToken = Boolean(
      error.config?.headers?.Authorization ||
        (typeof window !== 'undefined' && localStorage.getItem('token'))
    );

    // 1. Network or CORS failure (no HTTP response received)
    if (!error.response) {
      console.error('[API Network/CORS Error]', {
        method,
        endpoint,
        code: error.code || 'NETWORK_ERROR',
        message: error.message
      });

      const networkError: ApiError = {
        code: 'NETWORK_ERROR',
        status: 0,
        message: 'Unable to reach the server. Please check your connection and try again.'
      };
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;
    const validErrorPayload = hasStructuredApiError(data) ? data.error : null;

    // 2. Intentional 401 Unauthorized handling based on endpoint and auth context
    if (status === 401) {
      const isLoginOrRegister =
        endpoint.endsWith('/auth/login') || endpoint.endsWith('/auth/register');
      const isSessionProbe = endpoint.endsWith('/auth/me');
      const isLogout = endpoint.endsWith('/auth/logout');

      // Recover session (clear invalid state & redirect to login) when a supposedly authenticated
      // user (has a stored token or hit a protected resource) receives 401
      if (!isLoginOrRegister && !isLogout && (!isSessionProbe || hadAuthToken)) {
        clearSessionAndNotify();
      } else if (isSessionProbe && !hadAuthToken && typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }

      if (!validErrorPayload) {
        console.error('[API Unexpected Auth Response]', {
          method,
          endpoint,
          status
        });
      }

      const authError: ApiError = {
        code: validErrorPayload?.code || 'UNAUTHORIZED_ERROR',
        status,
        isExpectedAuthError: Boolean(validErrorPayload),
        message: validErrorPayload?.message || 'Authentication required. Please sign in.',
        details: validErrorPayload?.details
      };
      return Promise.reject(authError);
    }

    // 3. Server errors (5xx)
    if (status >= 500) {
      console.error('[API Server Error]', {
        method,
        endpoint,
        status,
        code: validErrorPayload?.code || 'SERVER_ERROR'
      });

      const serverError: ApiError = {
        code: validErrorPayload?.code || 'SERVER_ERROR',
        status,
        message: validErrorPayload?.message || 'A server error occurred. Please try again shortly.',
        details: validErrorPayload?.details
      };
      return Promise.reject(serverError);
    }

    // 4. Malformed non-5xx error response
    if (!validErrorPayload) {
      console.error('[API Malformed Error Response]', {
        method,
        endpoint,
        status
      });

      const malformedError: ApiError = {
        code: 'MALFORMED_RESPONSE',
        status,
        message: 'Received an unexpected response from the server.'
      };
      return Promise.reject(malformedError);
    }

    // 5. Expected operational 4xx client errors (400 validation, 403, 404, 409 conflict, 429 rate limit)
    const clientError: ApiError = {
      code: validErrorPayload.code,
      status,
      message: validErrorPayload.message,
      details: validErrorPayload.details
    };
    return Promise.reject(clientError);
  }
);
