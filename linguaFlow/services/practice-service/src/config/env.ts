import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3006', 10),
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://linguaflow:linguaflow@localhost:5432/linguaflow_practice',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:3007',
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
