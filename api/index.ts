import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

let appInstance: ReturnType<typeof createApp> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await connectDB();

    if (!appInstance) {
      appInstance = createApp();
    }

    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? req.url : `/${req.url}`}`;
    }

    return appInstance(req, res);
  } catch (error: any) {
    console.error('[Serverless] Unhandled request error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? undefined : error?.message,
      })
    );
  }
}
