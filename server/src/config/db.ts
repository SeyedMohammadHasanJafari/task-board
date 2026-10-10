import mongoose from 'mongoose';
import { ENV } from './env.js';

export async function connectDB(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[Database] MongoDB connection failed:', error);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB runtime error:', err);
});
