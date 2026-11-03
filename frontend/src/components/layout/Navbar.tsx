import React from 'react';
import { Menu, CheckSquare, LogOut, User } from 'lucide-react';
import { Button } from '../common/Button';

export interface NavbarProps {
  onToggleSidebar?: () => void;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  userName = 'User',
  userEmail = '',
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
              TaskMaster
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Workspace
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-semibold text-slate-800 leading-tight">{userName}</span>
          <span className="text-xs text-slate-400">{userEmail}</span>
        </div>

        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs">
          <User className="w-4 h-4" />
        </div>

        {onLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Log out</span>
          </Button>
        )}
      </div>
    </header>
  );
};
