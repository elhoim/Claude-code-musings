import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

export const env = {
  PORT: parseInt(optionalEnv('PORT', '3000'), 10),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  LOG_LEVEL: optionalEnv('LOG_LEVEL', 'info'),

  USER_SERVICE_URL: optionalEnv('USER_SERVICE_URL', 'http://localhost:3001'),
  LESSON_SERVICE_URL: optionalEnv('LESSON_SERVICE_URL', 'http://localhost:3002'),
  SRS_SERVICE_URL: optionalEnv('SRS_SERVICE_URL', 'http://localhost:3003'),
  GRAMMAR_SERVICE_URL: optionalEnv('GRAMMAR_SERVICE_URL', 'http://localhost:3004'),
  STORY_SERVICE_URL: optionalEnv('STORY_SERVICE_URL', 'http://localhost:3005'),
  PRACTICE_SERVICE_URL: optionalEnv('PRACTICE_SERVICE_URL', 'http://localhost:3006'),
  AI_SERVICE_URL: optionalEnv('AI_SERVICE_URL', 'http://localhost:3007'),
} as const;
