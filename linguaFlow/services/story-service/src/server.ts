import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { extractUser } from './middleware/extract-user';
import { errorHandler } from './middleware/error-handler';
import storyRoutes from './routes/story.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(extractUser);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'story-service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/stories', storyRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.warn(`Story service listening on port ${env.PORT}`);
});

export default app;
