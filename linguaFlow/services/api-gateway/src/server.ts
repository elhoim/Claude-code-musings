import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { env } from './config/env.js';
import { requestId } from './middleware/request-id.js';
import { errorHandler } from './middleware/error-handler.js';
import { router } from './routes/index.js';

const logger = pino({
  level: env.LOG_LEVEL,
  name: 'api-gateway',
});

const app = express();

// Core middleware
app.use(cors());
app.use(helmet());
app.use(
  pinoHttp({
    logger,
    quietReqLogger: true,
  }),
);

// Rate limiting: 100 requests per 15 minutes
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    },
  }),
);

// Request ID
app.use(requestId);

// Routes
app.use(router);

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`API Gateway listening on port ${env.PORT} [${env.NODE_ENV}]`);
});

export { app };
