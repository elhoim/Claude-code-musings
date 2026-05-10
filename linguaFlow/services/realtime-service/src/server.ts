import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'realtime-service', phase: 4, timestamp: new Date().toISOString() });
});

// Phase 4: Real-time communication
// WebSocket: /ws — Real-time messaging for Constellation sessions
// WebRTC Signaling: /ws/rtc — Voice/video call signaling
// REST: POST /api/v1/realtime/sessions — Create session room
// REST: GET /api/v1/realtime/sessions/:id — Get session info

const PORT = parseInt(process.env.PORT || '3011', 10);
app.listen(PORT, () => {
  console.warn(`Realtime service (stub) listening on port ${PORT}`);
});

export default app;
