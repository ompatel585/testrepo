import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  // private readonly keyPrefix = 'app:cache:'; // optional prefix for all keys
  private readonly keyPrefix = ''; // optional prefix for all keys
  private readonly defaultTTL: number;
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    configService: ConfigService,
  ) {
    this.defaultTTL = configService.get('redisConfig').defaultTTL;
  }

  // Get redis connection status
  isConnected(): boolean {
    try {
      return this.redis.status === 'ready';
    } catch (err) {
      this.logger.error(`Redis status check failed`, err);
      return false;
    }
  }

  // Get value from cache
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(this.keyPrefix + key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      this.logger.error(`Redis GET failed for key ${key}`, err);
      return null;
    }
  }

  // Set value in cache with TTL in seconds
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTTL;

    try {
      if (ttl && ttl > 0) {
        // Expirable key
        await this.redis.set(this.keyPrefix + key, JSON.stringify(value), 'EX', ttl);
      } else {
        // Non-expiring key
        await this.redis.set(this.keyPrefix + key, JSON.stringify(value));
      }
    } catch (err) {
      this.logger.error(`Redis SET failed for key ${key}`, err);
    }
  }

  // Delete a key
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(this.keyPrefix + key);
    } catch (err) {
      this.logger.error(`Redis DEL failed for key ${key}`, err);
    }
  }

  // Clear all keys (use with caution in production!)
  async reset(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (err) {
      this.logger.error(`Redis FLUSHDB failed`, err);
    }
  }

  // Check if a key exists
  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(this.keyPrefix + key);
      return exists === 1;
    } catch (err) {
      this.logger.error(`Redis EXISTS failed for key ${key}`, err);
      return false;
    }
  }

  // Get remaining TTL for a key
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(this.keyPrefix + key); // seconds
    } catch (err) {
      this.logger.error(`Redis TTL failed for key ${key}`, err);
      return -2; // -2 means key does not exist
    }
  }
}
