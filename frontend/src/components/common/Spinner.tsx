import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-2" role="status">
      <Loader2 className={cn('animate-spin text-cyan-400', sizes[size], className)} />
      {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
