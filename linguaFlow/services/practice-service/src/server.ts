import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { extractUser } from './middleware/extract-user';
import { errorHandler } from './middleware/error-handler';
import drillRoutes from './routes/drill.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(extractUser);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'practice-service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/practice', drillRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.warn(`Practice service listening on port ${env.PORT}`);
});

export default app;
