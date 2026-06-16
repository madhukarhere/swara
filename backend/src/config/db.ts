import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../lib/logger';

export async function connectDB(uri?: string): Promise<typeof mongoose> {
  const target = uri || (env.isTest ? env.MONGODB_TEST_URI : env.MONGODB_URI);
  mongoose.set('strictQuery', true);
  await mongoose.connect(target, { serverSelectionTimeoutMS: 8000 });
  logger.info(`MongoDB connected: ${target.replace(/\/\/[^@]*@/, '//***@')}`);
  return mongoose;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
}
