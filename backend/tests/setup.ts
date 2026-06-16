import { beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB(); // NODE_ENV=test -> uses MONGODB_TEST_URI
  }
});

afterAll(async () => {
  await disconnectDB();
});
