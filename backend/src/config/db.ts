import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const connectDatabase = async (uri: string = env.MONGODB_URI): Promise<typeof mongoose> => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri);
    logger.info(`✅ Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error);
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
