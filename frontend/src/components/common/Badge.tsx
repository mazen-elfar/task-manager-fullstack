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
    pending:
      'bg-amber-500/15 text-amber-300 border-amber-500/30 ring-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.12)]',
    completed:
      'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 ring-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.12)]',
    low:
      'bg-sky-500/15 text-sky-300 border-sky-500/30 ring-sky-500/20 shadow-[0_0_10px_rgba(56,189,248,0.12)]',
    medium:
      'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 ring-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.12)]',
    high:
      'bg-rose-500/15 text-rose-300 border-rose-500/30 ring-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.12)]',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/80 ring-slate-700/20'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border ring-1 font-medium select-none backdrop-blur-sm',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full shadow-sm',
          variant === 'pending' && 'bg-amber-400 animate-pulse',
          variant === 'completed' && 'bg-emerald-400',
          variant === 'low' && 'bg-sky-400',
          variant === 'medium' && 'bg-indigo-400',
          variant === 'high' && 'bg-rose-400 animate-pulse',
          variant === 'neutral' && 'bg-slate-400'
        )}
      />
      {children}
    </span>
  );
};
