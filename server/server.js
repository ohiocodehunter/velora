import app from './app.js';
import config from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import logger from './utils/logger.js';

let server;

async function start() {
  try {
    await connectDB();
    server = app.listen(config.port, () => {
      logger.info(`VELORA API listening on http://localhost:${config.port} (${config.nodeEnv})`);
      logger.info(`Allowed client origin: ${config.allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} received — shutting down`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});

start();
