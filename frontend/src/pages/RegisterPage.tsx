import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/common/Toast';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { CheckSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { ApiError } from '../types/auth';

const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .email('Please enter a valid email address')
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError(null);
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password
      });
      success('Welcome to TaskMaster!', 'Account Created');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setServerError(apiError.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4">
          <CheckSquare className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Start organizing and prioritizing your tasks seamlessly.
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
              label="Full Name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Jane Doe"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="jane@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
