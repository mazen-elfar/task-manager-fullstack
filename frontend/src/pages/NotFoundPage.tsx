import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 text-center relative z-10">
      <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_25px_rgba(56,189,248,0.25)]">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-black text-white tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-sm mt-1.5 mb-6">
        The celestial coordinates you are navigating to do not exist or may have shifted.
      </p>
      <Link to="/dashboard">
        <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to Dashboard</Button>
      </Link>
    </div>
  );
};
