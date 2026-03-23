import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { env } from './config/env.js';
import { authRoutes } from './routes/auth.routes.js';
import { profileRoutes } from './routes/profile.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const logger = pino({ name: 'user-service' });

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'user-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', profileRoutes);

// Error handling
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`User service listening on port ${env.PORT}`);
});

export { app };
