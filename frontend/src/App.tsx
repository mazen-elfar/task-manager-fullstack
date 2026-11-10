import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { Spinner } from './components/common/Spinner';
import { ParticleBackground } from './components/common/ParticleBackground';

// Route-level code splitting for performance and bundle size optimization
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-transparent">
    <Spinner size="lg" label="Loading page..." />
  </div>
);

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <ParticleBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <BrowserRouter>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </div>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
