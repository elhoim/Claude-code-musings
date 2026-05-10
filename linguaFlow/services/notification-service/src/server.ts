import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'notification-service', phase: 3, timestamp: new Date().toISOString() });
});

// Phase 3: Push notification endpoints
// POST /api/v1/notifications/register — Register device token
// POST /api/v1/notifications/preferences — Update notification preferences
// POST /api/v1/notifications/send — Internal: trigger notification

const PORT = parseInt(process.env.PORT || '3008', 10);
app.listen(PORT, () => {
  console.warn(`Notification service (stub) listening on port ${PORT}`);
});

export default app;
