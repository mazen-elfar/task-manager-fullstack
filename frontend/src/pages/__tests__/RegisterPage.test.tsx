import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../RegisterPage';
import { AuthProvider } from '../../features/auth/AuthContext';
import { ToastProvider } from '../../components/common/Toast';
import { authService } from '../../services/authService';

vi.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn().mockRejectedValue(new Error('Unauthenticated')),
    register: vi.fn(),
    logout: vi.fn()
  }
}));

const renderRegisterPage = async () => {
  const view = render(
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <RegisterPage />
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

describe('RegisterPage Component', () => {
  it('renders all required registration input fields', async () => {
    await renderRegisterPage();

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('rejects passwords that do not match confirmation', async () => {
    await renderRegisterPage();

    await userEvent.type(screen.getByLabelText(/Full Name/i), 'Alice Doe');
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'alice@example.com');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'differentPassword');

    await userEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('displays error banner if email already exists', async () => {
    vi.mocked(authService.register).mockRejectedValueOnce({
      code: 'CONFLICT_ERROR',
      message: 'An account with this email address already exists'
    });

    await renderRegisterPage();

    await userEvent.type(screen.getByLabelText(/Full Name/i), 'Alice Duplicate');
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'existing@example.com');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');

    await userEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/An account with this email address already exists/i)).toBeInTheDocument();
    });
  });
});
