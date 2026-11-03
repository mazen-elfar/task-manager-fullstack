import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AppLayout } from './components/layout/AppLayout';
import { useAuth } from './features/auth/useAuth';

const DashboardPlaceholder: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <AppLayout userName={user?.name} userEmail={user?.email} onLogout={logout}>
      <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm text-center">
        <h2 className="text-xl font-bold text-slate-900">Welcome, {user?.name}!</h2>
        <p className="text-slate-500 mt-1">Authentication is fully integrated.</p>
      </div>
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
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
                  <DashboardPlaceholder />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
