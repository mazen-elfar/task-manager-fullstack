import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { PublicRoute } from '../../routes/PublicRoute';
import { AuthProvider } from '../../features/auth/AuthContext';
import { ToastProvider } from '../../components/common/Toast';
import { authService } from '../../services/authService';

vi.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn().mockRejectedValue(new Error('Unauthenticated')),
    login: vi.fn(),
    logout: vi.fn()
  }
}));

const renderLoginPage = async () => {
  const view = render(
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );

  // Await session verification in AuthProvider to settle without act() warnings
  await waitFor(() => {
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });

  return view;
};

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Unauthenticated'));
  });

  it('renders login form with inputs and sign in button', async () => {
    await renderLoginPage();

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('validates required email and password fields on submit', async () => {
    await renderLoginPage();
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  it('submits valid credentials and calls authService.login', async () => {
    const mockUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    vi.mocked(authService.login).mockResolvedValueOnce({
      success: true,
      user: mockUser,
      token: 'jwt-token-123'
    });

    await renderLoginPage();

    await userEvent.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('displays error alert on invalid credentials', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({
      code: 'UNAUTHORIZED_ERROR',
      message: 'Invalid email or password'
    });

    await renderLoginPage();

    await userEvent.type(screen.getByLabelText(/Email Address/i), 'bad@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('keeps LoginPage mounted inside PublicRoute on failed login, displays error, and allows retry', async () => {
    let rejectLogin: (reason?: unknown) => void;
    vi.mocked(authService.login).mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectLogin = reject;
        })
    );

    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route path="/dashboard" element={<div>Dashboard View</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/Email Address/i), 'bad@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // LoginPage must remain mounted while login is in flight (no PublicRoute full-screen loading takeover)
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    rejectLogin!({
      code: 'UNAUTHORIZED_ERROR',
      status: 401,
      message: 'Invalid email or password'
    });

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toHaveValue('bad@example.com');
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeEnabled();
    });
  });

  it('transitions from LoginPage inside PublicRoute to dashboard on successful login without white-screen loader', async () => {
    let resolveLogin: (value: unknown) => void;
    vi.mocked(authService.login).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
    );

    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route path="/dashboard" element={<div>Dashboard View</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/Email Address/i), 'alex@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Remains on LoginPage while request is in flight (button shows loading state)
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    resolveLogin!({
      success: true,
      user: {
        id: '1',
        name: 'Alex',
        email: 'alex@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      token: 'jwt-token'
    });

    await waitFor(() => {
      expect(screen.getByText('Dashboard View')).toBeInTheDocument();
    });
  });
});
