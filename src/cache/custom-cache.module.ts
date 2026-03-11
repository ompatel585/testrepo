import { Module } from '@nestjs/common';
import { HUNDRED, ONE_MINUTE_IN_MILL_SEC } from '../common/constants';
import { CacheModule } from '@nestjs/cache-manager';
import { CustomCacheStore } from './custom-cache.store';
import { CustomCacheService } from './custom-cache.service';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: new CustomCacheStore({
        maxSizeInMB: HUNDRED, // Set max size to 100MB
        ttl: ONE_MINUTE_IN_MILL_SEC, // Default TTL of 1 minute
      }),
    }),
  ],
  providers: [CustomCacheService],
  exports: [CustomCacheService],
})
export class CustomCacheModule {}
