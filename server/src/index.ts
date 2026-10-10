import http from 'node:http';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { setupSocketServer } from './socket/index.js';
import { setupYjsServer } from './socket/yjs.js';

async function bootstrap() {
  console.log(`[Bootstrap] Starting Task Board Server in ${ENV.NODE_ENV} mode...`);

  // Connect Database
  await connectDB();

  // Create App & HTTP Server
  const app = createApp();
  const server = http.createServer(app);

  // Initialize Socket.io Real-Time Engine
  setupSocketServer(server);

  // Initialize Yjs CRDT Collaboration WebSocket Engine
  setupYjsServer(server);

  server.listen(ENV.PORT, () => {
    console.log(`[server] Listening on http://localhost:${ENV.PORT}`);
    console.log(`[socket] Real-time engine attached`);
    console.log(`[yjs] CRDT WebSocket provider attached at /yjs`);
    console.log(`[health] Endpoint available at http://localhost:${ENV.PORT}/api/health`);
  });

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, () => {
      console.log(`\n[Shutdown] Received ${signal}. Closing HTTP server...`);
      server.close(() => {
        console.log('[Shutdown] HTTP server closed.');
        process.exit(0);
      });
    });
  }
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal startup error:', err);
  process.exit(1);
});
