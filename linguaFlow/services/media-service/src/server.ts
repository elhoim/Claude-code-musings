import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'media-service', phase: 2, timestamp: new Date().toISOString() });
});

// Phase 2: Media processing endpoints
// POST /api/v1/media/upload — Upload audio recording
// POST /api/v1/media/transcribe — Transcribe audio (Whisper API)
// POST /api/v1/media/tts — Text-to-speech generation
// POST /api/v1/media/import — Import external media (YouTube, podcast)

const PORT = parseInt(process.env.PORT || '3010', 10);
app.listen(PORT, () => {
  console.warn(`Media service (stub) listening on port ${PORT}`);
});

export default app;
