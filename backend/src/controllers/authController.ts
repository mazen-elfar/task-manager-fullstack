import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { env } from '../config/env.js';

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);

    setAuthCookie(res, result.token);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);

    setAuthCookie(res, result.token);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
