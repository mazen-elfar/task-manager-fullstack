import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
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

const renderLoginPage = () => {
  return render(
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

describe('LoginPage Component', () => {
  it('renders login form with inputs and sign in button', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('validates required email and password fields on submit', async () => {
    renderLoginPage();
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

    renderLoginPage();

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

    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/Email Address/i), 'bad@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });
});
