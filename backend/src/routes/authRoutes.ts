import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, getCurrentUser } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { env } from '../config/env.js';

const router = Router();

// Dedicated rate limiting for sensitive authentication endpoints (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'test' ? 10000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Too many authentication attempts. Please try again after 15 minutes.'
    }
  }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authenticateUser, logout);
router.get('/me', authenticateUser, getCurrentUser);

export default router;
