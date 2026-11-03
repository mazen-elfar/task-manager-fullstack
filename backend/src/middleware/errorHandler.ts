import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const rawIssues = (err as unknown as { issues?: Array<{ path: (string | number)[]; message: string }>; errors?: Array<{ path: (string | number)[]; message: string }> });
    const issueList = rawIssues.issues || rawIssues.errors || [];
    const formattedErrors = issueList.map((e) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : '',
      message: e.message
    }));
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: formattedErrors
      }
    });
    return;
  }

  // 2. Custom Application Operational Errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
    return;
  }

  // 3. Mongoose Cast Error (invalid ObjectId)
  if (typeof err === 'object' && err !== null && 'name' in err && (err as { name: string }).name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid resource identifier format'
      }
    });
    return;
  }

  // 4. Mongoose Duplicate Key Error (E11000)
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000) {
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_RESOURCE',
        message: 'A resource with this identifier already exists'
      }
    });
    return;
  }

  // 5. Unhandled / Unexpected Errors
  logger.error('Unhandled Server Error:', err);
  const isDev = env.NODE_ENV === 'development';
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isDev && err instanceof Error ? err.message : 'An unexpected error occurred. Please try again later.'
    }
  });
};
