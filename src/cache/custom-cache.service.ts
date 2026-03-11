import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CustomCacheStore } from './custom-cache.store';

@Injectable()
export class CustomCacheService {
  private customCacheStore: CustomCacheStore;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.customCacheStore = (this.cacheManager as any).store;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async get(key: string): Promise<any> {
    return this.cacheManager.get(key);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async has(key: string): Promise<boolean> {
    return this.customCacheStore.has(key);
  }

  async reset(): Promise<void> {
    await this.customCacheStore.reset();
  }

  getCacheSize(): number {
    return this.customCacheStore.getCacheSize();
  }

  getCacheSizeInMB(): number {
    return this.customCacheStore.getCacheSizeInMB();
  }

  getCacheSizeInKB(): number {
    return this.customCacheStore.getCacheSizeInKB();
  }

  getItemCount(): number {
    return this.customCacheStore.getItemCount();
  }

  getCacheMemoryUtilizationPercentage(): number {
    return this.customCacheStore.getCacheMemoryUtilizationPercentage();
  }

  getOldestItemAndExpiry(): {
    item: any;
    expiresInSeconds: number | null;
  } {
    return this.customCacheStore.getOldestItemAndExpiry();
  }
}
