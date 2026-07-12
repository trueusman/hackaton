const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

async function start() {
  try {
    await connectDB();
    const server = app.listen(env.PORT, () => {
      console.log(`[server] MaintainIQ API listening on port ${env.PORT} (${env.NODE_ENV})`);
    });

    const shutdown = (signal) => {
      console.log(`[server] ${signal} received, shutting down gracefully`);
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  }
}

start();
