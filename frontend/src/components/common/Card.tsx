import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl shadow-black/40 overflow-hidden transition-all duration-300',
        hoverable && 'hover:shadow-[0_12px_35px_rgba(0,0,0,0.6)] hover:border-cyan-500/30 hover:bg-slate-900/75',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
