import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let listenersAttached = false;

const attachConnectionListeners = (): void => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error occurred:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected successfully.');
  });
};

export const connectDatabase = async (uri: string = env.MONGODB_URI): Promise<typeof mongoose> => {
  try {
    mongoose.set('strictQuery', true);
    attachConnectionListeners();

    const conn = await mongoose.connect(uri, {
      maxPoolSize: env.NODE_ENV === 'test' ? 5 : 20,
      minPoolSize: env.NODE_ENV === 'test' ? 1 : 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    logger.info(`✅ Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB');
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB.');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
};
