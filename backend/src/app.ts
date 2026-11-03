import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

export const createApp = (): Application => {
  const app: Application = express();

  // 1. Trust proxy in production if behind reverse proxy (Render, Railway, Vercel)
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // 2. HTTP Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // 3. CORS Configuration
  const allowedOrigins = [
    env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server) or matching allowed origins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  // 4. Request Body Parsing with tight size limits
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(cookieParser());

  // 5. Global API Rate Limiting
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env.NODE_ENV === 'test' ? 10000 : 300, // Generous for tests, controlled for runtime
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests from this IP, please try again after 15 minutes.'
      }
    }
  });

  app.use('/api', globalLimiter);

  // 6. Health Check Endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV
    });
  });

  // 7. Base API Info Endpoint
  app.get('/api/v1', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'Task Manager API',
      version: 'v1',
      documentation: '/docs/api.md',
      status: 'active'
    });
  });

  // 8. 404 & Centralized Error Handlers (routes will be mounted in next commits)
  // Catch 404 for undefined routes
  app.use(notFoundHandler);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
