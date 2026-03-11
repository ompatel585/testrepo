import { CacheManagerOptions } from '@nestjs/cache-manager';

export interface CustomCacheManagerOptions extends CacheManagerOptions {
  maxSizeInMB?: number; // Maximum cache size in MB
}

export interface CustomCacheEntry {
  value: any;
  size: number; // Size in bytes
  lastAccessed: number;
  ttl?: number;
}
