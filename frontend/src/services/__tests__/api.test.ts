import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '../api';
import { authService } from '../authService';

const makeAxiosError = (
  config: InternalAxiosRequestConfig,
  options: {
    status?: number;
    data?: unknown;
    code?: string;
    message?: string;
  }
): AxiosError => {
  const response = options.status
    ? {
        status: options.status,
        statusText: 'Error',
        headers: {},
        config,
        data: options.data
      }
    : undefined;

  return new AxiosError(
    options.message || 'Request failed',
    options.code || (options.status ? 'ERR_BAD_REQUEST' : 'ERR_NETWORK'),
    config,
    {},
    response
  );
};

describe('API Client & Auth Error Handling', () => {
  const originalAdapter = apiClient.defaults.adapter;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let dispatchEventSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    consoleErrorSpy.mockRestore();
    dispatchEventSpy.mockRestore();
  });

  it('handles 401 on POST /auth/login cleanly without console.error or auth:unauthorized event', async () => {
    apiClient.defaults.adapter = async (config) => {
      throw makeAxiosError(config, {
        status: 401,
        data: {
          success: false,
          error: {
            code: 'UNAUTHORIZED_ERROR',
            message: 'Invalid email or password'
          }
        }
      });
    };

    await expect(
      authService.login({ email: 'user@example.com', password: 'secret-password' })
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED_ERROR',
      status: 401,
      isExpectedAuthError: true,
      message: 'Invalid email or password'
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('handles 409 on POST /auth/register and 401 on POST /auth/logout without console.error or auth:unauthorized', async () => {
    apiClient.defaults.adapter = async (config) => {
      throw makeAxiosError(config, {
        status: 409,
        data: {
          success: false,
          error: {
            code: 'CONFLICT_ERROR',
            message: 'An account with this email address already exists'
          }
        }
      });
    };

    await expect(
      authService.register({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      })
    ).rejects.toMatchObject({
      code: 'CONFLICT_ERROR',
      status: 409,
      message: 'An account with this email address already exists'
    });

    localStorage.setItem('token', 'expired-token');
    apiClient.defaults.adapter = async (config) => {
      throw makeAxiosError(config, {
        status: 401,
        data: {
          success: false,
          error: {
            code: 'UNAUTHORIZED_ERROR',
            message: 'Authentication required. Please log in.'
          }
        }
      });
    };

    await expect(authService.logout()).rejects.toMatchObject({
      code: 'UNAUTHORIZED_ERROR',
      status: 401
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('stores token and returns user on valid POST /auth/login', async () => {
    const mockUser = {
      id: 'u1',
      name: 'Alex',
      email: 'alex@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };

    apiClient.defaults.adapter = async (config) => ({
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data: {
        success: true,
        user: mockUser,
        token: 'jwt-valid-token'
      }
    });

    const res = await authService.login({ email: 'alex@example.com', password: 'Password123!' });

    expect(res.user).toEqual(mockUser);
    expect(localStorage.getItem('token')).toBe('jwt-valid-token');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('treats initial GET /auth/me 401 without stored token as unauthenticated with no error log or redirect event', async () => {
    apiClient.defaults.adapter = async (config) => {
      throw makeAxiosError(config, {
        status: 401,
        data: {
          success: false,
          error: {
            code: 'UNAUTHORIZED_ERROR',
            message: 'Authentication required. Please log in.'
          }
        }
      });
    };

    const user = await authService.getCurrentUser();

    expect(user).toBeNull();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('clears token and dispatches auth:unauthorized when GET /auth/me fails with 401 while a token exists', async () => {
    localStorage.setItem('token', 'expired-jwt-token');

    apiClient.defaults.adapter = async (config) => {
      expect((config.headers as AxiosHeaders).get('Authorization')).toBe('Bearer expired-jwt-token');
      throw makeAxiosError(config, {
        status: 401,
        data: {
          success: false,
          error: {
            code: 'UNAUTHORIZED_ERROR',
            message: 'Invalid or expired authentication token'
          }
        }
      });
    };

    const user = await authService.getCurrentUser();

    expect(user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:unauthorized' }));
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('clears token and dispatches auth:unauthorized on 401 from protected resource endpoints', async () => {
    localStorage.setItem('token', 'stale-jwt-token');

    apiClient.defaults.adapter = async (config) => {
      throw makeAxiosError(config, {
        status: 401,
        data: {
          success: false,
          error: {
            code: 'UNAUTHORIZED_ERROR',
            message: 'Invalid or expired authentication token'
          }
        }
      });
    };

    await expect(apiClient.get('/tasks')).rejects.toMatchObject({
      code: 'UNAUTHORIZED_ERROR',
      status: 401
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:unauthorized' }));
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('logs sanitized diagnostic info on 500 server error without exposing sensitive payloads or tokens', async () => {
    localStorage.setItem('token', 'super-secret-jwt');

    apiClient.defaults.adapter = async (config) => {
      throw makeAxiosError(config, {
        status: 500,
        data: {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection lost'
          }
        }
      });
    };

    await expect(
      authService.login({ email: 'user@example.com', password: 'my-plain-password-123' })
    ).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      status: 500,
      message: 'Database connection lost'
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const loggedString = JSON.stringify(consoleErrorSpy.mock.calls[0]);
    expect(loggedString).not.toContain('my-plain-password-123');
    expect(loggedString).not.toContain('super-secret-jwt');
    expect(loggedString).not.toContain('Authorization');
    expect(loggedString).toContain('/auth/login');
    expect(loggedString).toContain('500');
  });

  it('logs sanitized diagnostic info on network/CORS failure and returns user-friendly error', async () => {
    apiClient.defaults.adapter = async (config) => {
      throw makeAxiosError(config, {
        code: 'ERR_NETWORK',
        message: 'Network Error'
      });
    };

    await expect(apiClient.get('/tasks?search=secret')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: 0,
      message: 'Unable to reach the server. Please check your connection and try again.'
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const loggedString = JSON.stringify(consoleErrorSpy.mock.calls[0]);
    expect(loggedString).toContain('ERR_NETWORK');
    expect(loggedString).not.toContain('search=secret');
  });

  it('logs malformed HTML/non-JSON 502 gateway errors cleanly', async () => {
    apiClient.defaults.adapter = async (config) => {
      throw makeAxiosError(config, {
        status: 502,
        data: '<html><body>502 Bad Gateway</body></html>'
      });
    };

    await expect(apiClient.get('/tasks')).rejects.toMatchObject({
      code: 'SERVER_ERROR',
      status: 502,
      message: 'A server error occurred. Please try again shortly.'
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('preserves request cancellation without logging an error', async () => {
    apiClient.defaults.adapter = async () => {
      throw new axios.CanceledError('Request aborted');
    };

    try {
      await apiClient.get('/tasks');
      expect.unreachable('Expected request to be cancelled');
    } catch (err) {
      expect(axios.isCancel(err)).toBe(true);
    }
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
