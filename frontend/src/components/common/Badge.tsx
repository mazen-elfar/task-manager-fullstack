import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'pending' | 'completed' | 'low' | 'medium' | 'high' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
  ...props
}) => {
  const variants = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
    low: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-600/20',
    medium: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/20',
    high: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border ring-1 font-medium select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'pending' && 'bg-amber-500',
          variant === 'completed' && 'bg-emerald-500',
          variant === 'low' && 'bg-sky-500',
          variant === 'medium' && 'bg-indigo-500',
          variant === 'high' && 'bg-rose-500',
          variant === 'neutral' && 'bg-slate-400'
        )}
      />
      {children}
    </span>
  );
};
