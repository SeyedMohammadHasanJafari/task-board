import mongoose from 'mongoose';
import { ENV } from './env.js';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      autoIndex: !ENV.isProduction,
      serverSelectionTimeoutMS: 5000,
      dbName: 'task-board',
    };

    cached.promise = mongoose.connect(ENV.MONGODB_URI, opts).then((m) => {
      console.log(`[Database] MongoDB Connected: ${m.connection.host}/${m.connection.name}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('[Database] MongoDB connection failed:', error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB runtime error:', err);
});
