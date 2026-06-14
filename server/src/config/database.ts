import mongoose from "mongoose";
import { logger } from "./logger";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  try {
    mongoose.connection.on('connected', () => {
      logger.info(`MongoDB connected: ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (error) => {
      logger.error(`MongoDB connection error: ${error.message}`);
      process.exit(1);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    await mongoose.connect(env.MONGO_URL);
  } catch (error) {
    logger.error({ err: error }, '❌ MongoDB connection failed');
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
}
