import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export interface AppLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  taskCounts?: {
    total: number;
    pending: number;
    completed: number;
  };
  activeFilter?: string;
  onSelectFilter?: (filter: 'all' | 'pending' | 'completed') => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  userName,
  userEmail,
  onLogout,
  taskCounts,
  activeFilter,
  onSelectFilter
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative z-10">
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        userName={userName}
        userEmail={userEmail}
        onLogout={onLogout}
      />
      <div className="flex flex-1 w-full max-w-7xl mx-auto relative">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          taskCounts={taskCounts}
          activeFilter={activeFilter}
          onSelectFilter={onSelectFilter}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
