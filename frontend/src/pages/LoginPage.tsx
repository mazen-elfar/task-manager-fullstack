import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/common/Toast';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { CheckSquare, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
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
    setValue,
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

  const fillDemoAccount = () => {
    setValue('email', 'alex@example.com');
    setValue('password', 'Password123!');
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Top Interactive Particle Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-lg text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span>Interactive Particle Field • Move cursor to repel • Click to burst</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 text-white shadow-[0_0_25px_rgba(56,189,248,0.35)] border border-cyan-400/30 mb-4">
          <CheckSquare className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to access your dashboard and manage your tasks.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/60 backdrop-blur-2xl py-8 px-6 shadow-2xl shadow-black/60 rounded-3xl border border-white/10 sm:px-10">
          {serverError && (
            <div
              className="mb-6 rounded-2xl bg-rose-500/15 border border-rose-500/30 p-4 flex items-start gap-3 animate-fadeIn"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-sm text-rose-200 font-medium">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              leftIcon={<Lock className="w-4 h-4" />}
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

          {/* Quick Demo Helper */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Need sample credentials?</span>
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Auto-fill Demo
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
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
