import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title?: string; message: string }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message }: { type?: ToastType; title?: string; message: string }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => addToast({ type: 'success', title, message }),
    [addToast]
  );
  const error = useCallback(
    (message: string, title?: string) => addToast({ type: 'error', title, message }),
    [addToast]
  );
  const info = useCallback(
    (message: string, title?: string) => addToast({ type: 'info', title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
            info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />
          };

          const borders = {
            success: 'border-emerald-500/40 bg-slate-900/95 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.2)]',
            error: 'border-rose-500/40 bg-slate-900/95 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.2)]',
            info: 'border-cyan-500/40 bg-slate-900/95 text-cyan-100 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
          };

          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl transition-all duration-200 animate-fadeIn',
                borders[t.type]
              )}
              role="alert"
            >
              {icons[t.type]}
              <div className="flex-1 text-sm">
                {t.title && <div className="font-semibold text-white">{t.title}</div>}
                <div className="mt-0.5 opacity-90 text-slate-200">{t.message}</div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
