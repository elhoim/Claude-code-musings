import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3005', 10),
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://linguaflow:linguaflow@localhost:5432/linguaflow_stories',
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
