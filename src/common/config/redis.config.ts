import { registerAs } from '@nestjs/config';

export default registerAs('redisConfig', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || 'redis-secret',
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  // optional: default TTL for cache
  defaultTTL: parseInt(process.env.REDIS_DEFAULT_TTL, 10) || 60,
  required: false,
}));
