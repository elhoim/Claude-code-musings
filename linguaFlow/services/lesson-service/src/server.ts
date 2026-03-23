import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { env } from './config/env.js';
import { lessonRouter } from './routes/lesson.routes.js';
import { placementRouter } from './routes/placement.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const logger = pino({ name: 'lesson-service' });

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(
  pinoHttp({
    logger,
    quietReqLogger: true,
  }),
);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'lesson-service' });
});

// Routes
app.use('/api/v1/lessons', lessonRouter);
app.use('/api/v1/lessons/placement', placementRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Lesson service listening on port ${env.PORT}`);
});

export { app };
