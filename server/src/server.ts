import { logger } from './config/logger';
import { connectDB, disconnectDB } from './config/database';
import app from './app';
import { env } from './config/env';
import http from "http";


async function startServer(): Promise<void> {
  // database connection  call
  await connectDB();

  // connect to port
  const server = http.createServer(app);
  server.listen(env.PORT, () => {
    logger.info(`🚀 Yatra backend ready on ${env.SERVER_URL} (${env.NODE_ENV})`);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => async () => {
    logger.info(`${signal} received — shutting down…`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    // Force-quit after 10s
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

}


startServer().catch((err) => {
  logger.error({ err }, '❌ Server failed to start');
  process.exit(1);
});




