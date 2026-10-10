import dotenv from 'dotenv';
import path from 'node:path';

// Load .env file
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task-board',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-task-board',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  isProduction: process.env.NODE_ENV === 'production',
};
