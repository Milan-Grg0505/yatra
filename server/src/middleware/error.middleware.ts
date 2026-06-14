import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongoServerError } from 'mongodb';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { env } from '../config/env';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): Response {
  // Already an ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined && { details: err.details }),
    });
  }

  // Zod validation
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      details: err.flatten().fieldErrors,
    });
  }

  // Mongoose validation
  if (err instanceof mongoose.Error.ValidationError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [field, e] of Object.entries(err.errors)) {
      fieldErrors[field] = [e.message];
    }
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      details: fieldErrors,
    });
  }

  // Mongoose cast (bad ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Duplicate key
  if ((err as MongoServerError).code === 11000) {
    const key = Object.keys((err as MongoServerError).keyPattern ?? {})[0] ?? 'field';
    return res.status(409).json({
      success: false,
      message: `Duplicate ${key} — already exists`,
    });
  }

  // Default
  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.NODE_ENV === 'development' && {
      stack: err instanceof Error ? err.stack : String(err),
    }),
  });
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}
