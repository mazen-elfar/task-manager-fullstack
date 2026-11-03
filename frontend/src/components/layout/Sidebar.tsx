import React from 'react';
import { CheckSquare, Clock, CheckCircle2, ListFilter, X, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  taskCounts?: {
    total: number;
    pending: number;
    completed: number;
  };
  activeFilter?: string;
  onSelectFilter?: (filter: 'all' | 'pending' | 'completed') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  taskCounts = { total: 0, pending: 0, completed: 0 },
  activeFilter = 'all',
  onSelectFilter
}) => {
  const filterItems = [
    {
      id: 'all',
      label: 'All Tasks',
      icon: <ListFilter className="w-4 h-4" />,
      count: taskCounts.total,
      color: 'text-indigo-600'
    },
    {
      id: 'pending',
      label: 'Pending',
      icon: <Clock className="w-4 h-4" />,
      count: taskCounts.pending,
      color: 'text-amber-600'
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: <CheckCircle2 className="w-4 h-4" />,
      count: taskCounts.completed,
      color: 'text-emerald-600'
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 p-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <CheckSquare className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800">TaskMaster</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="py-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3">
          Views & Filters
        </span>
        <nav className="mt-2 space-y-1">
          {filterItems.map((item) => {
            const isActive = activeFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectFilter?.(item.id as 'all' | 'pending' | 'completed');
                  onClose();
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={item.color}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-semibold',
                    isActive ? 'bg-indigo-200/60 text-indigo-800' : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <div className="font-semibold text-slate-700">Protected Session</div>
            <div className="text-slate-400 text-[11px]">Strict IDOR isolation active</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-xs bg-white shadow-xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
