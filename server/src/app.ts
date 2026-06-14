import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
// import compression from 'compression';
// import pinoHttp from 'pino-http';
// import passport from './config/passport';
import { env } from './config/env';
import { logger } from './config/logger';
import { apiLimiter } from './middleware/rateLimiter.middleaware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './routes';

const app: Application = express();

// Trust first proxy (needed for accurate req.ip when behind nginx/cloud LB)
app.set('trust proxy', 1);

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  }),
);

// Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// Compression + logging
// app.use(compression());
// app.use(
//   pinoHttp({
//     logger,
//     customLogLevel: (_req, res, err) => {
//       if (err || res.statusCode >= 500) return 'error';
//       if (res.statusCode >= 400) return 'warn';
//       return 'info';
//     },
//     serializers: {
//       req: (req) => ({ method: req.method, url: req.url }),
//       res: (res) => ({ statusCode: res.statusCode }),
//     },
//   }),
// );

// Passport (stateless — we use JWT)
// app.use(passport.initialize());

// Rate limit ALL API routes
app.use('/api', apiLimiter);

// Mount routes
app.use('/api/v1', routes);

// 404 + error
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
