import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'analytics-service', phase: 3, timestamp: new Date().toISOString() });
});

// Phase 3: Analytics endpoints
// POST /api/v1/analytics/events — Log learning event
// GET /api/v1/analytics/dashboard — Get user dashboard data
// GET /api/v1/analytics/weekly-report — Get weekly learning report

const PORT = parseInt(process.env.PORT || '3009', 10);
app.listen(PORT, () => {
  console.warn(`Analytics service (stub) listening on port ${PORT}`);
});

export default app;
