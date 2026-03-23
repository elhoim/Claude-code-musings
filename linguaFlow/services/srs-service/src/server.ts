import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { env } from './config/env.js';
import { deckRouter } from './routes/deck.routes.js';
import { cardRouter } from './routes/card.routes.js';
import { reviewRouter } from './routes/review.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const logger = pino({ name: 'srs-service' });

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
  res.json({ status: 'ok', service: 'srs-service' });
});

// Routes
app.use('/api/v1/srs/decks', deckRouter);
app.use('/api/v1/srs/cards', cardRouter);
app.use('/api/v1/srs/reviews', reviewRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`SRS service listening on port ${env.PORT}`);
});

export { app };
