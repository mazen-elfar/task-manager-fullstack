import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { Spinner } from '../components/common/Spinner';

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
