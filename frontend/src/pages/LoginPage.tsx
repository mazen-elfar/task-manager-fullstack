import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/common/Toast';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { CheckSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { ApiError } from '../types/auth';

const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      await login(data);
      success('Logged in successfully', 'Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setServerError(apiError.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4">
          <CheckSquare className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to access your dashboard and manage your tasks.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
          {serverError && (
            <div
              className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 font-medium">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
