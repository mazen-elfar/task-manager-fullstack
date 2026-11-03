import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/dashboard">
        <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to Dashboard</Button>
      </Link>
    </div>
  );
};
