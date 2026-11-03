import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../services/authService.js';
import { UnauthorizedError } from '../utils/errors.js';

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticateUser = (req: Request, _res: Response, next: NextFunction): void => {
  let token: string | undefined;

  // 1. Check for token in HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check for Authorization header (Bearer <token>)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new UnauthorizedError('Authentication required. Please log in.');
  }

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
