import { env } from '../config/env.js';

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (env.NODE_ENV !== 'test') {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
    }
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (env.NODE_ENV !== 'test') {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
    }
  },
  error: (message: string, error?: unknown) => {
    if (env.NODE_ENV !== 'test') {
      const errDetails = error instanceof Error ? { message: error.message, stack: env.NODE_ENV === 'development' ? error.stack : undefined } : error;
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, errDetails);
    }
  }
};
