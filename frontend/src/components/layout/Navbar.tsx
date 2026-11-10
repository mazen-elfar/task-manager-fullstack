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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#0b1220]/80 px-4 sm:px-6 backdrop-blur-xl shadow-lg shadow-black/30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 text-white shadow-[0_0_16px_rgba(56,189,248,0.35)] border border-cyan-400/30">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white leading-none flex items-center gap-1.5">
              TaskMaster
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-semibold text-cyan-300">
                PRO
              </span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
              Interactive Workspace
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-semibold text-slate-100 leading-tight">{userName}</span>
          <span className="text-xs text-slate-400 font-mono">{userEmail}</span>
        </div>

        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold text-xs shadow-[0_0_10px_rgba(56,189,248,0.2)]">
          <User className="w-4 h-4" />
        </div>

        {onLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20"
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
